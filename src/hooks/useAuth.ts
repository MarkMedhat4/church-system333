// ============================================================
// useAuth — Admin + Student Auth Hook
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AdminSession, StudentSession } from '@/types';
import {
  adminLogin as serviceAdminLogin,
  adminLogout as serviceAdminLogout,
  studentLogin as serviceStudentLogin,
  studentLogout as serviceStudentLogout,
  getAdminSession,
  getStudentSession,
} from '@/services/auth';

// ── Admin Auth Hook ────────────────────────────────────────
export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check existing Supabase session
    const checkSession = async () => {
      const session = await getAdminSession();
      setAdmin(session);
      setLoading(false);
    };
    checkSession();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAdmin(null);
        } else if (event === 'SIGNED_IN') {
          const adminSession = await getAdminSession();
          setAdmin(adminSession);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await serviceAdminLogin(email, password);
    if (result.data) {
      setAdmin(result.data);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await serviceAdminLogout();
    setAdmin(null);
    router.push('/login');
  }, [router]);

  return { admin, loading, login, logout, isAdmin: !!admin };
}

// ── Student Auth Hook ──────────────────────────────────────
export function useStudentAuth() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getStudentSession();
    setStudent(session);
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string) => {
    const result = await serviceStudentLogin(phone);
    if (result.data) {
      setStudent(result.data);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    serviceStudentLogout();
    setStudent(null);
    router.push('/student-login');
  }, [router]);

  return { student, loading, login, logout, isLoggedIn: !!student };
}

// ── Guard Hook (Admin pages) ───────────────────────────────
export function useRequireAdmin() {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/login');
    }
  }, [admin, loading, router]);

  return { admin, loading };
}

// ── Guard Hook (Student pages) ─────────────────────────────
export function useRequireStudent() {
  const { student, loading } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) {
      router.replace('/student-login');
    }
  }, [student, loading, router]);

  return { student, loading };
}
