// ============================================================
// /profile — Student Profile Page
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import StudentPhoto from '@/components/ui/StudentPhoto';
import { SkeletonProfile } from '@/components/skeletons';
import { useRequireStudent } from '@/hooks/useAuth';
import { useStudentAttendance } from '@/hooks/useAttendance';
import { usePoints } from '@/hooks/usePoints';
import { useStudentById } from '@/hooks/useStudents';
import { formatDate, formatDateTime, getPhotoUrl } from '@/services/utils';
import { APP_CONFIG } from '@/lib/constants';
import {
  Phone, BookOpen, Calendar, Star, QrCode,
  CheckCircle, LogOut, User, Clock,
} from 'lucide-react';
import QRCode from 'qrcode.react';
import { studentLogout } from '@/services/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { student: session, loading: sessionLoading } = useRequireStudent();
  const { student, loading } = useStudentById(session?.student_code || null);
  const { records: attendance } = useStudentAttendance(session?.student_code || null);
  const { logs } = usePoints(session?.student_code || undefined);
  const router = useRouter();

  function handleLogout() {
    studentLogout();
    toast.success('تم تسجيل الخروج');
    router.push('/student-login');
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md mx-auto pt-8">
          <SkeletonProfile />
        </div>
      </div>
    );
  }

  if (!student) return null;

  const thisMonthAttendance = attendance.filter(a => {
    const month = new Date().toISOString().slice(0, 7);
    return a.date.startsWith(month);
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold opacity-80">{APP_CONFIG.NAME}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white text-xs transition-colors"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-8">

        {/* Profile Card */}
        <div className="card overflow-hidden">
          {/* Blue top strip */}
          <div className="h-20 bg-gradient-to-r from-blue-900 to-blue-700" />
          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 overflow-hidden shadow-lg">
                <StudentPhoto photoUrl={student.photo_url} name={student.name} size="xl" />
              </div>
              <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm px-3 py-1 rounded-xl flex items-center gap-1">
                <Star size={14} className="text-amber-400" />
                {student.points} نقطة
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-slate-500 text-sm font-mono">{student.student_code}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="إجمالي الحضور"   value={attendance.length} color="blue" />
          <StatBox label="حضور هذا الشهر" value={thisMonthAttendance} color="emerald" />
          <StatBox label="النقاط"          value={student.points}    color="amber" />
        </div>

        {/* Personal Info */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={16} className="text-blue-700" />
            بياناتي
          </h3>
          <div className="space-y-2">
            <InfoRow icon={<BookOpen size={14} />} label="الصف" value={student.stage} />
            <InfoRow icon={<Phone size={14} />}    label="الهاتف" value={student.phone} />
            {student.birthday && (
              <InfoRow icon={<Calendar size={14} />} label="الميلاد" value={formatDate(student.birthday)} />
            )}
            {student.confessor && (
              <InfoRow icon={<User size={14} />} label="الأب الاعترافي" value={student.confessor} />
            )}
          </div>
        </div>

        {/* QR Code */}
        {student.qr_code && (
          <div className="card p-5 flex flex-col items-center gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 self-start">
              <QrCode size={16} className="text-blue-700" />
              QR Code الخاص بي
            </h3>
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <QRCode value={student.qr_code} size={180} />
            </div>
            <p className="text-xs text-slate-400 text-center">
              أرِ هذا الكود للمشرف عند الحضور يوم الأحد
            </p>
          </div>
        )}

        {/* Attendance History */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Clock size={16} className="text-blue-700" />
            سجل الحضور
          </h3>
          {attendance.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">لا يوجد حضور مسجل بعد</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {attendance.slice(0, 20).map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{formatDate(a.date)}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{a.time?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Points Log */}
        {logs.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Star size={16} className="text-amber-500" />
              سجل النقاط
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {logs.slice(0, 15).map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm py-1.5">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{log.reason}</span>
                  <span className={`font-bold text-xs ${log.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  };
  return (
    <div className={`rounded-2xl p-3 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
