// ============================================================
// Attendance Service — QR Scan + Anti-Cheat
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import {
  Attendance, AttendanceScanResult, ServiceResult,
  MonthlyAttendanceData,
} from '@/types';
import { SCAN_RULES } from '@/lib/constants';
import { getToday, getCurrentTime, isScanWindowOpen } from './utils';
import { fetchStudentByQR } from './students';

// ── Anti-Cheat State (in-memory per session) ──────────────
let scanCount = 0;
let scanWindowStart = Date.now();
let lastScanTime = 0;
const recentlyScanned = new Set<string>(); // student_codes scanned this minute

function resetScanWindow() {
  const now = Date.now();
  if (now - scanWindowStart > 60_000) {
    scanCount = 0;
    scanWindowStart = now;
    recentlyScanned.clear();
  }
}

// ── SCAN QR CODE ──────────────────────────────────────────

/**
 * معالجة مسح QR Code مع كل قواعد الـ Anti-Cheat
 */
export async function processQRScan(
  qrData: string
): Promise<AttendanceScanResult> {
  // 1. Check scan window (Sunday 6PM–9PM)
  const windowCheck = isScanWindowOpen();
  if (!windowCheck.allowed) {
    return {
      success: false,
      message: windowCheck.reason || 'وقت المسح غير متاح',
      outsideWindow: true,
      notSunday: new Date().getDay() !== SCAN_RULES.DAY_OF_WEEK,
    };
  }

  // 2. Anti-cheat: 8-second lock between any scans
  const now = Date.now();
  const timeSinceLast = now - lastScanTime;
  if (lastScanTime > 0 && timeSinceLast < SCAN_RULES.LOCK_SECONDS * 1000) {
    const remaining = Math.ceil((SCAN_RULES.LOCK_SECONDS * 1000 - timeSinceLast) / 1000);
    return {
      success: false,
      message: `انتظر ${remaining} ثانية قبل المسح التالي`,
    };
  }

  // 3. Anti-cheat: 30 scans/minute limit
  resetScanWindow();
  if (scanCount >= SCAN_RULES.MAX_SCANS_PER_MINUTE) {
    return {
      success: false,
      message: 'تم تجاوز الحد الأقصى للمسح (30/دقيقة). انتظر قليلاً.',
    };
  }

  // 4. Find student by QR
  const { data: student, error } = await fetchStudentByQR(qrData);
  if (error || !student) {
    return { success: false, message: 'QR Code غير صالح أو الطالب غير مفعّل' };
  }

  // 5. Anti-cheat: same student not scanned in last minute
  if (recentlyScanned.has(student.student_code)) {
    return {
      success: false,
      message: `${student.name} — تم مسحه مؤخراً`,
      student,
      alreadyScanned: true,
    };
  }

  // 6. Check UNIQUE(student_id, date) — no duplicate on same day
  const today = getToday();
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('student_id', student.student_code)
    .eq('date', today)
    .single();

  if (existing) {
    return {
      success: false,
      message: `${student.name} — سُجِّل حضوره اليوم مسبقاً`,
      student,
      alreadyScanned: true,
    };
  }

  // 7. Record attendance
  const { error: insertError } = await supabase.from('attendance').insert({
    student_id: student.student_code,
    student_name: student.name,
    date: today,
    time: getCurrentTime(),
    status: 'present',
  });

  if (insertError) {
    return { success: false, message: 'فشل تسجيل الحضور: ' + insertError.message };
  }

  // 8. Update anti-cheat state
  lastScanTime = now;
  scanCount++;
  recentlyScanned.add(student.student_code);

  return {
    success: true,
    message: `✅ تم تسجيل حضور ${student.name}`,
    student,
  };
}

// ── FETCH ATTENDANCE ──────────────────────────────────────

export async function fetchTodayAttendance(): Promise<ServiceResult<Attendance[]>> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', getToday())
      .order('time', { ascending: false });

    if (error) return { data: null, error: 'فشل جلب حضور اليوم' };
    return { data: data as Attendance[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchAttendanceByStudent(
  student_code: string
): Promise<ServiceResult<Attendance[]>> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student_code)
      .order('date', { ascending: false });

    if (error) return { data: null, error: 'فشل جلب حضور الطالب' };
    return { data: data as Attendance[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchAttendanceByMonth(
  monthYear: string // YYYY-MM
): Promise<ServiceResult<Attendance[]>> {
  try {
    const startDate = `${monthYear}-01`;
    const endDate = `${monthYear}-31`;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) return { data: null, error: 'فشل جلب بيانات الشهر' };
    return { data: data as Attendance[], error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchMonthlyAttendanceStats(): Promise<ServiceResult<MonthlyAttendanceData[]>> {
  try {
    // Get last 6 months
    const { data, error } = await supabase
      .from('attendance')
      .select('date')
      .gte('date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (error) return { data: null, error: 'فشل جلب الإحصائيات الشهرية' };

    // Group by month
    const monthMap: Record<string, number> = {};
    (data || []).forEach(row => {
      const month = row.date.slice(0, 7); // YYYY-MM
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const result: MonthlyAttendanceData[] = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('ar-EG', {
          month: 'short', year: 'numeric'
        }),
        count,
      }));

    return { data: result, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function fetchTodayAttendanceCount(): Promise<ServiceResult<number>> {
  try {
    const { count, error } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', getToday());

    if (error) return { data: null, error: 'فشل جلب عدد الحضور' };
    return { data: count || 0, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

// ── MANUAL ATTENDANCE ─────────────────────────────────────

export async function addManualAttendance(
  student_code: string,
  student_name: string,
  date: string
): Promise<ServiceResult> {
  try {
    const { error } = await supabase.from('attendance').insert({
      student_id: student_code,
      student_name,
      date,
      time: getCurrentTime(),
      status: 'present',
    });

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'الطالب مسجل بالفعل في هذا التاريخ' };
      }
      return { data: null, error: 'فشل تسجيل الحضور' };
    }

    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}

export async function deleteAttendanceRecord(id: string): Promise<ServiceResult> {
  try {
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) return { data: null, error: 'فشل حذف السجل' };
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'حدث خطأ غير متوقع' };
  }
}
