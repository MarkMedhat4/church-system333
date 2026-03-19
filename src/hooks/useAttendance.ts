// ============================================================
// useAttendance — Attendance Hook + Realtime
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Attendance, AttendanceScanResult } from '@/types';
import {
  fetchTodayAttendance, fetchAttendanceByStudent,
  fetchAttendanceByMonth, fetchMonthlyAttendanceStats,
  fetchTodayAttendanceCount, processQRScan,
  addManualAttendance, deleteAttendanceRecord,
} from '@/services/attendance';
import { getCurrentMonthYear } from '@/services/utils';

// ── useTodayAttendance ────────────────────────────────────
export function useTodayAttendance() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [listResult, countResult] = await Promise.all([
      fetchTodayAttendance(),
      fetchTodayAttendanceCount(),
    ]);
    setRecords(listResult.data || []);
    setCount(countResult.data || 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: live updates when attendance is added
  useEffect(() => {
    const channel = supabase
      .channel('today-attendance')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { records, loading, count, refresh: load };
}

// ── useQRScanner ──────────────────────────────────────────
export function useQRScanner(bypassTimeCheck = false) {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<AttendanceScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<AttendanceScanResult[]>([]);

  const handleScan = useCallback(async (qrData: string) => {
    if (processing) return;
    setProcessing(true);

    const result = await processQRScan(qrData, bypassTimeCheck);
    setLastResult(result);
    setHistory(prev => [result, ...prev.slice(0, 19)]); // keep last 20

    // Auto-clear result after 4 seconds
    setTimeout(() => setLastResult(null), 4000);
    setProcessing(false);
  }, [processing]);

  return {
    scanning,
    setScanning,
    lastResult,
    processing,
    history,
    handleScan,
  };
}

// ── useStudentAttendance ──────────────────────────────────
export function useStudentAttendance(student_code: string | null) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student_code) return;
    setLoading(true);
    fetchAttendanceByStudent(student_code).then(({ data }) => {
      setRecords(data || []);
      setLoading(false);
    });
  }, [student_code]);

  return { records, loading, total: records.length };
}

// ── useMonthlyAttendanceStats ─────────────────────────────
export function useMonthlyAttendanceStats() {
  const [data, setData] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyAttendanceStats().then(({ data }) => {
      setData(data || []);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

// ── useAttendanceByMonth ──────────────────────────────────
export function useAttendanceByMonth(monthYear?: string) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const month = monthYear || getCurrentMonthYear();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchAttendanceByMonth(month);
    setRecords(data || []);
    setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  return { records, loading, count: records.length, refresh: load };
}
