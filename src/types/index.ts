// ============================================================
// Types — Church Management System
// ============================================================

// ── Student ──────────────────────────────────────────────
export type StudentStatus = '0' | '1' | '-1'; // pending | approved | rejected

export interface Student {
  student_code: string;
  name: string;
  phone: string;
  parent_phone: string;
  stage: string;
  birthday: string | null;
  confessor: string | null;
  points: number;
  qr_code: string | null;
  photo_url: string | null;
  active: boolean;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentRegistrationForm {
  // Step 1 — البيانات الشخصية
  name: string;
  phone: string;
  parent_phone: string;
  birthday: string;
  // Step 2 — البيانات الدراسية
  stage: string;
  confessor: string;
  // Step 3 — الصورة
  photo?: File | null;
}

// ── Attendance ────────────────────────────────────────────
export interface Attendance {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  time: string;
  status: string;
  created_by: string | null;
  created_at: string;
}

export interface AttendanceScanResult {
  success: boolean;
  message: string;
  student?: Student;
  alreadyScanned?: boolean;
  outsideWindow?: boolean;
  notSunday?: boolean;
}

// ── Points ────────────────────────────────────────────────
export interface PointsLog {
  id: string;
  student_id: string;
  student_name: string;
  points: number;        // positive = add, negative = deduct
  reason: string;
  date: string;
  created_by: string | null;
  created_at: string;
}

// ── Admin ─────────────────────────────────────────────────
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// ── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  totalStudents: number;
  approvedStudents: number;
  pendingStudents: number;
  rejectedStudents: number;
  todayAttendance: number;
  monthAttendance: number;
  topStudents: LeaderboardEntry[];
  upcomingBirthdays: BirthdayEntry[];
  monthBirthdays: BirthdayEntry[];
  recentActivity: RecentActivity[];
}

export interface LeaderboardEntry {
  student_code: string;
  name: string;
  points: number;
  stage: string;
  photo_url: string | null;
  rank: number;
}

export interface BirthdayEntry {
  student_code: string;
  name: string;
  birthday: string;
  stage: string;
  photo_url: string | null;
  daysUntil: number;
}

export interface RecentActivity {
  id: string;
  type: 'attendance' | 'registration' | 'points' | 'approval';
  description: string;
  student_name: string;
  time: string;
}

// ── Chart Data ────────────────────────────────────────────
export interface MonthlyAttendanceData {
  month: string;
  count: number;
}

export interface WeeklyAttendanceData {
  week: string;
  count: number;
}

// ── Auth ──────────────────────────────────────────────────
export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface StudentSession {
  student_code: string;
  name: string;
  phone: string;
  stage: string;
  photo_url: string | null;
  points: number;
}

// ── API Responses ─────────────────────────────────────────
export interface ServiceResult<T = void> {
  data: T | null;
  error: string | null;
}

// ── Pagination ────────────────────────────────────────────
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Filters ───────────────────────────────────────────────
export interface StudentFilters {
  search?: string;
  stage?: string;
  status?: StudentStatus | 'all';
  active?: boolean | 'all';
}

export interface AttendanceFilters {
  date?: string;
  month?: string;    // YYYY-MM
  student_id?: string;
}
