// ============================================================
// Utils — Helper Functions
// ============================================================

import { EGYPTIAN_PHONE_REGEX, SCAN_RULES } from './constants';

// ── Student Code Generator ────────────────────────────────
export function generateStudentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REG-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ── Phone Validation ──────────────────────────────────────
export function isValidEgyptianPhone(phone: string): boolean {
  return EGYPTIAN_PHONE_REGEX.test(phone.trim());
}

// ── Date Helpers ──────────────────────────────────────────
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '—';
  return timeStr.slice(0, 5); // HH:MM
}

export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '—';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getCurrentTime(): string {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}

export function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// ── Birthday Helpers ──────────────────────────────────────
export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const bday = new Date(birthday);
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (thisYear < today) {
    thisYear.setFullYear(today.getFullYear() + 1);
  }
  const diff = thisYear.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isBirthdayThisMonth(birthday: string): boolean {
  const today = new Date();
  const bday = new Date(birthday);
  return bday.getMonth() === today.getMonth();
}

// ── QR / Scan Validation ──────────────────────────────────
export function isScanWindowOpen(): { allowed: boolean; reason?: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const hour = now.getHours();

  if (dayOfWeek !== SCAN_RULES.DAY_OF_WEEK) {
    return { allowed: false, reason: 'المسح متاح فقط يوم الأحد' };
  }
  if (hour < SCAN_RULES.START_HOUR) {
    return { allowed: false, reason: `المسح يبدأ الساعة ${SCAN_RULES.START_HOUR}:00 مساءً` };
  }
  if (hour >= SCAN_RULES.END_HOUR) {
    return { allowed: false, reason: `انتهى وقت المسح (${SCAN_RULES.END_HOUR}:00 مساءً)` };
  }
  return { allowed: true };
}

// ── Class Name Helper ─────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ── Number Formatting ─────────────────────────────────────
export function formatNumber(num: number): string {
  return num.toLocaleString('ar-EG');
}

// ── Photo URL Helper ──────────────────────────────────────
export function getPhotoUrl(path: string | null): string {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student-photos/${path}`;
}

// ── Truncate Text ─────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ── Export to Excel helper (uses xlsx) ───────────────────
export function downloadAsExcel(data: Record<string, unknown>[], filename: string): void {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  });
}

// ── Local Storage Helpers (for sessions) ─────────────────
export const storage = {
  set: (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    try { return JSON.parse(item) as T; } catch { return null; }
  },
  remove: (key: string) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  },
};

export const STUDENT_SESSION_KEY = 'church_student_session';
export const ADMIN_SESSION_KEY = 'church_admin_session';
