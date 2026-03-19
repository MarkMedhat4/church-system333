// ============================================================
// usePoints + useDashboard Hooks
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PointsLog } from '@/types';
import {
  fetchPointsLog, addPoints, deductPoints,
} from '@/services/points';
import {
  fetchLeaderboard, fetchStudentStats,
  fetchUpcomingBirthdays, fetchMonthBirthdays,
} from '@/services/students';
import {
  fetchTodayAttendanceCount, fetchMonthlyAttendanceStats,
} from '@/services/attendance';

// ── usePoints ─────────────────────────────────────────────
export function usePoints(student_code?: string) {
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchPointsLog(student_code);
    setLogs(data || []);
    setLoading(false);
  }, [student_code]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('points-log-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points_log' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const add = useCallback(async (
    code: string, name: string, pts: number, reason: string
  ) => {
    const res = await addPoints(code, name, pts, reason);
    if (!res.error) load();
    return res;
  }, [load]);

  const deduct = useCallback(async (
    code: string, name: string, pts: number, reason: string
  ) => {
    const res = await deductPoints(code, name, pts, reason);
    if (!res.error) load();
    return res;
  }, [load]);

  return { logs, loading, add, deduct, refresh: load };
}

// ── useDashboard ──────────────────────────────────────────
export function useDashboard() {
  const [stats, setStats] = useState<{
    total: number; approved: number; pending: number;
    rejected: number; inactive: number;
  } | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [monthBirthdays, setMonthBirthdays] = useState<any[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      statsRes,
      todayRes,
      leaderboardRes,
      birthdaysRes,
      monthBdayRes,
      chartRes,
    ] = await Promise.all([
      fetchStudentStats(),
      fetchTodayAttendanceCount(),
      fetchLeaderboard(10),
      fetchUpcomingBirthdays(),
      fetchMonthBirthdays(),
      fetchMonthlyAttendanceStats(),
    ]);

    setStats(statsRes.data);
    setTodayCount(todayRes.data || 0);
    setLeaderboard(leaderboardRes.data || []);
    setUpcomingBirthdays(birthdaysRes.data || []);
    setMonthBirthdays(monthBdayRes.data || []);
    setMonthlyChart(chartRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh on any students/attendance change
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return {
    stats,
    todayCount,
    leaderboard,
    upcomingBirthdays,
    monthBirthdays,
    monthlyChart,
    loading,
    refresh: load,
  };
}
