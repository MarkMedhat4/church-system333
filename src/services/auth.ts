// ============================================================
// Auth Service — Admin (Supabase Auth) + Student (phone)
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import { AdminSession, StudentSession, ServiceResult } from '@/types';
import { storage, STUDENT_SESSION_KEY, ADMIN_SESSION_KEY } from './utils';

// ── ADMIN AUTH ────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string
): Promise<ServiceResult<AdminSession>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      return { data: null, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

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

export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
  storage.remove(ADMIN_SESSION_KEY);
}

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
 * بيجرب الرقم بالصفر وبدون الصفر عشان يغطي الحالتين
 */
export async function studentLogin(
  phone: string
): Promise<ServiceResult<StudentSession>> {
  try {
    const cleanPhone = phone.trim();

    // ── Try both formats: with 0 and without ─────────────
    const phoneVariants = [cleanPhone];
    if (cleanPhone.startsWith('0')) {
      phoneVariants.push(cleanPhone.slice(1)); // بدون الصفر
    } else {
      phoneVariants.push('0' + cleanPhone); // مع الصفر
    }

    let data: any = null;

    for (const variant of phoneVariants) {
      const { data: row } = await supabase
        .from('students')
        .select('student_code, name, phone, stage, photo_url, points, status, active')
        .eq('phone', variant)
        .maybeSingle();

      if (row) {
        data = row;
        break;
      }
    }

    // ── Not found ─────────────────────────────────────────
    if (!data) {
      return {
        data: null,
        error: 'رقم الهاتف غير مسجل — تأكد من الرقم أو سجّل بياناتك أولاً',
      };
    }

    // ── Pending ───────────────────────────────────────────
    if (data.status === '0') {
      return {
        data: null,
        error: 'طلبك قيد المراجعة ⏳ — انتظر موافقة الخادم',
      };
    }

    // ── Rejected ──────────────────────────────────────────
    if (data.status === '-1') {
      return {
        data: null,
        error: 'تم رفض طلبك ❌ — تواصل مع الخادم لمعرفة السبب',
      };
    }

    // ── Not active ────────────────────────────────────────
    if (!data.active) {
      return {
        data: null,
        error: 'حسابك غير مفعّل ⚠️ — تواصل مع الخادم',
      };
    }

    // ── Success ───────────────────────────────────────────
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
    return {
      data: null,
      error: 'حدث خطأ في الاتصال — حاول مرة أخرى',
    };
  }
}

export function studentLogout(): void {
  storage.remove(STUDENT_SESSION_KEY);
}

export function getStudentSession(): StudentSession | null {
  return storage.get<StudentSession>(STUDENT_SESSION_KEY);
}
