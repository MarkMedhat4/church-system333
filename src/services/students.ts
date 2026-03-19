// ============================================================
// Students Service — Business Logic
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import {
  Student, StudentRegistrationForm, ServiceResult,
  PaginatedResult, PaginationOptions, StudentFilters,
  StudentStatus,
} from '@/types';
import { APP_CONFIG } from '@/lib/constants';
import { generateStudentCode, getToday } from './utils';

// ── REGISTRATION ──────────────────────────────────────────

/**
 * تسجيل طالب جديد (3 خطوات)
 */
export async function registerStudent(
  form: StudentRegistrationForm
): Promise<ServiceResult<{ student_code: string }>> {
  try {
    // 1. Check duplicate phone
    const { data: existing } = await supabase
      .from('students')
      .select('student_code')
      .eq('phone', form.phone.trim())
      .single();

    if (existing) {
      return { data: null, error: 'رقم الهاتف مسجل بالفعل' };
    }

    // 2. Upload photo if provided
    let photo_url: string | null = null;
    if (form.photo) {
      const fileExt = form.photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, form.photo, { upsert: false });

      if (uploadError) {
        return { data: null, error: 'فشل رفع الصورة. حاول مرة أخرى.' };
      }
      photo_url = fileName;
    }

    // 3. Generate unique student code
    const student_code = generateStudentCode();

    // 4. Insert student
    const { error: insertError } = await supabase.from('students').insert({
      student_code,
      name: form.name.trim(),
      phone: form.phone.trim(),
      parent_phone: form.parent_phone.trim(),
      birthday: form.birthday || null,
      stage: form.stage,
      confessor: form.confessor?.trim() || null,
      photo_url,
      status: '0',
      active: false,
      points: 0,
    });

    if (insertError) {
      return { data: null, error: 'فشل التسجيل: ' + insertError.message };
    }

    return { data: { student_code }, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── APPROVAL / REJECTION ──────────────────────────────────

/**
 * قبول الطالب → status='1', active=true, QR يُنشأ تلقائياً بالـ trigger
 */
export async function approveStudent(
  student_code: string
): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('students')
      .update({ status: '1', active: true })
      .eq('student_code', student_code);

    if (error) return { data: null, error: 'فشل قبول الطالب' };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * رفض الطالب → status='-1', active=false
 */
export async function rejectStudent(
  student_code: string
): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('students')
      .update({ status: '-1', active: false })
      .eq('student_code', student_code);

    if (error) return { data: null, error: 'فشل رفض الطالب' };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── FETCH STUDENTS ────────────────────────────────────────

/**
 * جلب الطلاب مع pagination وفلاتر
 */
export async function fetchStudents(
  filters: StudentFilters = {},
  pagination: PaginationOptions = { page: 1, pageSize: APP_CONFIG.PAGE_SIZE }
): Promise<ServiceResult<PaginatedResult<Student>>> {
  try {
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,student_code.ilike.%${filters.search}%`
      );
    }
    if (filters.stage) query = query.eq('stage', filters.stage);
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.active !== undefined && filters.active !== 'all') {
      query = query.eq('active', filters.active);
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) return { data: null, error: 'فشل جلب الطلاب' };

    return {
      data: {
        data: data as Student[],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * جلب طلاب في الانتظار (للـ registrations page)
 */
export async function fetchPendingStudents(): Promise<ServiceResult<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', '0')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: 'فشل جلب الطلبات المعلقة' };
    return { data: data as Student[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * جلب بيانات طالب واحد
 */
export async function fetchStudentById(
  student_code: string
): Promise<ServiceResult<Student>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_code', student_code)
      .single();

    if (error || !data) return { data: null, error: 'الطالب غير موجود' };
    return { data: data as Student, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * جلب طالب بـ QR code
 */
export async function fetchStudentByQR(
  qr_code: string
): Promise<ServiceResult<Student>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('qr_code', qr_code)
      .eq('status', '1')
      .eq('active', true)
      .single();

    if (error || !data) return { data: null, error: 'QR Code غير صالح' };
    return { data: data as Student, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── UPDATE STUDENT ────────────────────────────────────────

/**
 * تحديث بيانات الطالب
 */
export async function updateStudent(
  student_code: string,
  updates: Partial<Student>
): Promise<ServiceResult<Student>> {
  try {
    // Remove protected fields
    const { student_code: _, qr_code, points, status, active, created_at, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('students')
      .update(safeUpdates)
      .eq('student_code', student_code)
      .select()
      .single();

    if (error) return { data: null, error: 'فشل تحديث البيانات' };
    return { data: data as Student, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * حذف طالب
 */
export async function deleteStudent(
  student_code: string
): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('student_code', student_code);

    if (error) return { data: null, error: 'فشل حذف الطالب' };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── DASHBOARD STATS ───────────────────────────────────────

export async function fetchStudentStats(): Promise<ServiceResult<{
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  inactive: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('status, active');

    if (error) return { data: null, error: 'فشل جلب الإحصائيات' };

    const stats = {
      total: data.length,
      approved: data.filter(s => s.status === '1').length,
      pending: data.filter(s => s.status === '0').length,
      rejected: data.filter(s => s.status === '-1').length,
      inactive: data.filter(s => s.status === '1' && !s.active).length,
    };

    return { data: stats, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── LEADERBOARD ───────────────────────────────────────────

export async function fetchLeaderboard(limit = 10): Promise<ServiceResult<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', '1')
      .eq('active', true)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: 'فشل جلب المتصدرين' };
    return { data: data as Student[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── BIRTHDAYS ─────────────────────────────────────────────

export async function fetchUpcomingBirthdays(): Promise<ServiceResult<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', '1')
      .eq('active', true)
      .not('birthday', 'is', null);

    if (error) return { data: null, error: 'فشل جلب أعياد الميلاد' };

    const today = new Date();
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    // Filter students with birthday in the next 7 days (ignore year)
    const upcoming = (data as Student[]).filter(s => {
      if (!s.birthday) return false;
      const bday = new Date(s.birthday);
      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
      return thisYear <= in7Days;
    });

    return { data: upcoming, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchMonthBirthdays(): Promise<ServiceResult<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', '1')
      .eq('active', true)
      .not('birthday', 'is', null);

    if (error) return { data: null, error: 'فشل جلب أعياد ميلاد الشهر' };

    const currentMonth = new Date().getMonth();

    const monthBdays = (data as Student[]).filter(s => {
      if (!s.birthday) return false;
      return new Date(s.birthday).getMonth() === currentMonth;
    });

    return { data: monthBdays, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}
