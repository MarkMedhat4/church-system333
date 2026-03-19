// ============================================================
// Points Service — Add / Deduct / Log
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import { PointsLog, ServiceResult } from '@/types';
import { getToday } from './utils';

// ── ADD POINTS ────────────────────────────────────────────

/**
 * إضافة نقاط لطالب مع تسجيل في points_log
 */
export async function addPoints(
  student_code: string,
  student_name: string,
  points: number,
  reason: string
): Promise<ServiceResult> {
  try {
    if (points <= 0) return { data: null, error: 'يجب أن تكون النقاط أكبر من صفر' };

    // 1. Insert log entry
    const { error: logError } = await supabase.from('points_log').insert({
      student_id: student_code,
      student_name,
      points,
      reason,
      date: getToday(),
    });

    if (logError) return { data: null, error: 'فشل تسجيل النقاط' };

    // 2. Update student total
    const { error: updateError } = await supabase.rpc('increment_points', {
      p_student_code: student_code,
      p_points: points,
    });

    // Fallback if RPC doesn't exist
    if (updateError) {
      const { data: student } = await supabase
        .from('students')
        .select('points')
        .eq('student_code', student_code)
        .single();

      await supabase
        .from('students')
        .update({ points: (student?.points || 0) + points })
        .eq('student_code', student_code);
    }

    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

/**
 * خصم نقاط من طالب
 */
export async function deductPoints(
  student_code: string,
  student_name: string,
  points: number,
  reason: string
): Promise<ServiceResult> {
  try {
    if (points <= 0) return { data: null, error: 'يجب أن تكون النقاط أكبر من صفر' };

    // Get current points
    const { data: student } = await supabase
      .from('students')
      .select('points')
      .eq('student_code', student_code)
      .single();

    if (!student) return { data: null, error: 'الطالب غير موجود' };

    const newPoints = Math.max(0, (student.points || 0) - points);

    // 1. Insert negative log entry
    const { error: logError } = await supabase.from('points_log').insert({
      student_id: student_code,
      student_name,
      points: -points,
      reason,
      date: getToday(),
    });

    if (logError) return { data: null, error: 'فشل تسجيل خصم النقاط' };

    // 2. Update student total
    await supabase
      .from('students')
      .update({ points: newPoints })
      .eq('student_code', student_code);

    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── FETCH POINTS ──────────────────────────────────────────

export async function fetchPointsLog(
  student_code?: string
): Promise<ServiceResult<PointsLog[]>> {
  try {
    let query = supabase
      .from('points_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (student_code) {
      query = query.eq('student_id', student_code);
    }

    const { data, error } = await query;

    if (error) return { data: null, error: 'فشل جلب سجل النقاط' };
    return { data: data as PointsLog[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchStudentPoints(
  student_code: string
): Promise<ServiceResult<number>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('points')
      .eq('student_code', student_code)
      .single();

    if (error) return { data: null, error: 'فشل جلب النقاط' };
    return { data: data.points || 0, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── SQL RPC HELPER (add to Supabase SQL editor) ───────────
/*
CREATE OR REPLACE FUNCTION increment_points(p_student_code TEXT, p_points INT)
RETURNS VOID AS $$
BEGIN
  UPDATE students SET points = points + p_points WHERE student_code = p_student_code;
END;
$$ LANGUAGE plpgsql;
*/
