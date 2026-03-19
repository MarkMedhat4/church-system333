// ============================================================
// Constants — Church Management System
// ============================================================

// ── المراحل الدراسية ──────────────────────────────────────
export const STAGES = [
  // إعدادي
  { value: 'الصف الأول الإعدادي',   label: 'الصف الأول الإعدادي',   group: 'إعدادي' },
  { value: 'الصف الثاني الإعدادي',  label: 'الصف الثاني الإعدادي',  group: 'إعدادي' },
  { value: 'الصف الثالث الإعدادي',  label: 'الصف الثالث الإعدادي',  group: 'إعدادي' },
  // ثانوي
  { value: 'الصف الأول الثانوي',    label: 'الصف الأول الثانوي',    group: 'ثانوي' },
  { value: 'الصف الثاني الثانوي',   label: 'الصف الثاني الثانوي',   group: 'ثانوي' },
  { value: 'الصف الثالث الثانوي',   label: 'الصف الثالث الثانوي',   group: 'ثانوي' },
] as const;

export type StageName = typeof STAGES[number]['value'];

// ── Student Status Labels ─────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  '0':  'في الانتظار',
  '1':  'مقبول',
  '-1': 'مرفوض',
};

export const STATUS_COLORS: Record<string, string> = {
  '0':  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  '1':  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  '-1': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

// ── QR / Attendance Rules ─────────────────────────────────
export const SCAN_RULES = {
  DAY_OF_WEEK: 0,             // 0 = Sunday
  START_HOUR: parseInt(process.env.NEXT_PUBLIC_SCAN_START_HOUR || '18'),
  END_HOUR: parseInt(process.env.NEXT_PUBLIC_SCAN_END_HOUR || '21'),
  LOCK_SECONDS: 8,            // Lock after each scan
  MAX_SCANS_PER_MINUTE: 30,   // Anti-spam
  ATTENDANCES_PER_POINT: 4,   // 4 attendances = 1 point
} as const;

// ── Egyptian Phone Regex ──────────────────────────────────
export const EGYPTIAN_PHONE_REGEX = /^01[0125]\d{8}$/;

// ── Points Reasons ────────────────────────────────────────
export const POINT_REASONS = [
  'مكافأة الحضور',
  'نشاط كنسي',
  'حفظ آيات',
  'سلوك ممتاز',
  'خصم – غياب',
  'خصم – سلوك',
  'أخرى',
] as const;

// ── App Info ──────────────────────────────────────────────
export const APP_CONFIG = {
  NAME: 'كنيسة الثلاثة فتية القديسين',
  SUBTITLE: 'خدمة الإعدادي والثانوي',
  CITY: 'أسوان',
  PAGE_SIZE: 20,             // Default pagination
} as const;

// ── Navigation Links (Admin) ──────────────────────────────
export const ADMIN_NAV = [
  { href: '/dashboard',      label: 'الرئيسية',         icon: 'LayoutDashboard' },
  { href: '/registrations',  label: 'طلبات التسجيل',    icon: 'ClipboardList' },
  { href: '/students',       label: 'الطلاب',            icon: 'Users' },
  { href: '/scanner',        label: 'مسح QR',            icon: 'QrCode' },
  { href: '/points',         label: 'النقاط',            icon: 'Star' },
  { href: '/id-cards',       label: 'بطاقات الهوية',    icon: 'CreditCard' },
  { href: '/reports',        label: 'التقارير',          icon: 'BarChart3' },
  { href: '/import',         label: 'استيراد',           icon: 'Upload' },
  { href: '/settings',       label: 'الإعدادات',        icon: 'Settings' },
] as const;
