// ============================================================
// Auth Service — Admin (Supabase Auth) + Student (phone)
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import { AdminSession, StudentSession, ServiceResult } from '@/types';
import { storage, STUDENT_SESSION_KEY, ADMIN_SESSION_KEY } from './utils';

// ── ADMIN AUTH ────────────────────────────────────────────

/**
 * تسجيل دخول الأدمن بالإيميل والباسورد
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<ServiceResult<AdminSession>> {
  try {
    // 1. Supabase Auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      return { data: null, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // 2. Verify this email is in the admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, name, email, role')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (adminError || !adminData) {
      await supabase.auth.signOut();
      return { data: null, error: 'هذا الحساب ليس له صلاحيات الأدمن' };
    }

    const session: AdminSession = {
      id: authData.user.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
    };

    storage.set(ADMIN_SESSION_KEY, session);
    return { data: session, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
  }
}

/**
 * تسجيل خروج الأدمن
 */
export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
  storage.remove(ADMIN_SESSION_KEY);
}

/**
 * الحصول على جلسة الأدمن الحالية
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data } = await supabase
      .from('admins')
      .select('id, name, email, role')
      .eq('email', session.user.email)
      .single();

    if (!data) return null;

    return {
      id: session.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch {
    return null;
  }
}

// ── STUDENT AUTH ──────────────────────────────────────────

/**
 * تسجيل دخول الطالب برقم الهاتف
 * يبحث في phone فقط (status=1 AND active=true)
 */
export async function studentLogin(
  phone: string
): Promise<ServiceResult<StudentSession>> {
  try {
    const cleanPhone = phone.trim();

    const { data, error } = await supabase
      .from('students')
      .select('student_code, name, phone, stage, photo_url, points, status, active')
      .eq('phone', cleanPhone)
      .single();

    if (error || !data) {
      return { data: null, error: 'رقم الهاتف غير مسجل' };
    }

    if (data.status !== '1' || !data.active) {
      if (data.status === '0') {
        return { data: null, error: 'طلبك لا يزال قيد المراجعة. انتظر موافقة الأدمن.' };
      }
      if (data.status === '-1') {
        return { data: null, error: 'تم رفض طلبك. تواصل مع الخادم.' };
      }
      return { data: null, error: 'حسابك غير نشط. تواصل مع الخادم.' };
    }

    const session: StudentSession = {
      student_code: data.student_code,
      name: data.name,
      phone: data.phone,
      stage: data.stage,
      photo_url: data.photo_url,
      points: data.points,
    };

    storage.set(STUDENT_SESSION_KEY, session);
    return { data: session, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
  }
}

/**
 * تسجيل خروج الطالب
 */
export function studentLogout(): void {
  storage.remove(STUDENT_SESSION_KEY);
}

/**
 * الحصول على جلسة الطالب من localStorage
 */
export function getStudentSession(): StudentSession | null {
  return storage.get<StudentSession>(STUDENT_SESSION_KEY);
}
