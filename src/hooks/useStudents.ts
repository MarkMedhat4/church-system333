// ============================================================
// useStudents — Students + Realtime
// ============================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Student, StudentFilters, PaginatedResult, PaginationOptions } from '@/types';
import {
  fetchStudents, fetchPendingStudents, fetchStudentById,
  approveStudent, rejectStudent, updateStudent, deleteStudent,
  fetchStudentStats,
} from '@/services/students';
import { APP_CONFIG } from '@/lib/constants';

// ── useStudents (with pagination + filters + realtime) ────
export function useStudents(initialFilters: StudentFilters = {}) {
  const [result, setResult] = useState<PaginatedResult<Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    pageSize: APP_CONFIG.PAGE_SIZE,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchStudents(filters, pagination);
    if (error) setError(error);
    else setResult(data);
    setLoading(false);
  }, [filters, pagination]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('students-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const approve = useCallback(async (student_code: string) => {
    const res = await approveStudent(student_code);
    if (!res.error) load();
    return res;
  }, [load]);

  const reject = useCallback(async (student_code: string) => {
    const res = await rejectStudent(student_code);
    if (!res.error) load();
    return res;
  }, [load]);

  const update = useCallback(async (student_code: string, updates: Partial<Student>) => {
    const res = await updateStudent(student_code, updates);
    if (!res.error) load();
    return res;
  }, [load]);

  const remove = useCallback(async (student_code: string) => {
    const res = await deleteStudent(student_code);
    if (!res.error) load();
    return res;
  }, [load]);

  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changeFilters = useCallback((newFilters: StudentFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    students: result?.data || [],
    loading,
    error,
    result,
    filters,
    pagination,
    setFilters: changeFilters,
    changePage,
    refresh: load,
    approve,
    reject,
    update,
    remove,
  };
}

// ── usePendingStudents ────────────────────────────────────
export function usePendingStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchPendingStudents();
    if (error) setError(error);
    else setStudents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('pending-students')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'students',
        filter: 'status=eq.0'
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { students, loading, error, count: students.length, refresh: load };
}

// ── useStudentById ────────────────────────────────────────
export function useStudentById(student_code: string | null) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student_code) return;
    setLoading(true);
    fetchStudentById(student_code).then(({ data, error }) => {
      if (error) setError(error);
      else setStudent(data);
      setLoading(false);
    });
  }, [student_code]);

  return { student, loading, error };
}

// ── useStudentStats ───────────────────────────────────────
export function useStudentStats() {
  const [stats, setStats] = useState<{
    total: number; approved: number; pending: number;
    rejected: number; inactive: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await fetchStudentStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('student-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { stats, loading, refresh: load };
}
