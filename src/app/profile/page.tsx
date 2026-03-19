// ============================================================
// /profile — Student Profile + Edit + Photo Upload
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SkeletonProfile } from '@/components/skeletons';
import { useRequireStudent } from '@/hooks/useAuth';
import { useStudentAttendance } from '@/hooks/useAttendance';
import { usePoints } from '@/hooks/usePoints';
import { useStudentById } from '@/hooks/useStudents';
import { formatDate, isValidEgyptianPhone, getPhotoUrl } from '@/services/utils';
import { updateStudent } from '@/services/students';
import { supabase } from '@/lib/supabaseClient';
import { STAGES, APP_CONFIG } from '@/lib/constants';
import {
  Phone, BookOpen, Calendar, Star, QrCode,
  CheckCircle, LogOut, User, Clock,
  Pencil, X, Save, Camera,
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

  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editForm, setEditForm]   = useState({
    phone: '', parent_phone: '', confessor: '', stage: '',
  });

  function startEdit() {
    if (!student) return;
    setEditForm({
      phone:        student.phone || '',
      parent_phone: student.parent_phone || '',
      confessor:    student.confessor || '',
      stage:        student.stage || '',
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setPhotoPreview(null);
    setPhotoFile(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    if (!student) return;

    if (!isValidEgyptianPhone(editForm.phone)) {
      toast.error('رقم هاتفك غير صحيح'); return;
    }
    if (!isValidEgyptianPhone(editForm.parent_phone)) {
      toast.error('رقم هاتف ولي الأمر غير صحيح'); return;
    }
    if (!editForm.stage) {
      toast.error('يرجى اختيار الصف'); return;
    }

    setSaving(true);

    // ── Upload photo if changed ───────────────────────
    let photo_url = student.photo_url;
    if (photoFile) {
      const ext      = photoFile.name.split('.').pop();
      const fileName = `${student.student_code}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('student-photos')
        .upload(fileName, photoFile, { upsert: true });

      if (uploadErr) {
        toast.error('فشل رفع الصورة');
        setSaving(false);
        return;
      }
      photo_url = fileName;
    }

    // ── Update student record ─────────────────────────
    const res = await updateStudent(student.student_code, {
      phone:        editForm.phone.trim(),
      parent_phone: editForm.parent_phone.trim(),
      confessor:    editForm.confessor.trim() || undefined,
      stage:        editForm.stage,
      photo_url:    photo_url || undefined,
    });

    setSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('تم حفظ التعديلات ✅');
      setEditing(false);
      window.location.reload();
    }
  }

  function handleLogout() {
    studentLogout();
    router.push('/student-login');
  }

  // ── Loading ───────────────────────────────────────────
  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md mx-auto pt-8"><SkeletonProfile /></div>
      </div>
    );
  }

  if (!student) return null;

  const thisMonthAttendance = attendance.filter(a =>
    a.date.startsWith(new Date().toISOString().slice(0, 7))
  ).length;

  const currentPhotoSrc = photoPreview || getPhotoUrl(student.photo_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold opacity-80">{APP_CONFIG.NAME}</h1>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-blue-200 hover:text-white text-xs transition-colors">
            <LogOut size={14} /> خروج
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-8">

        {/* ── Profile Card ───────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-blue-900 to-blue-700" />
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Photo — clickable in edit mode */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 overflow-hidden shadow-lg bg-blue-200">
                  {currentPhotoSrc && currentPhotoSrc !== '/default-avatar.png' ? (
                    <Image src={currentPhotoSrc} alt={student.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{student.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                {/* Camera overlay — edit mode only */}
                {editing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer">
                    <Camera size={20} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 font-bold text-sm px-3 py-1 rounded-xl flex items-center gap-1">
                <Star size={14} className="text-amber-400" />
                {student.points} نقطة
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-slate-500 text-sm font-mono">{student.student_code}</p>

            {editing && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <Camera size={12} /> اضغط على الصورة لتغييرها
              </p>
            )}
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="إجمالي الحضور"   value={attendance.length}   color="blue" />
          <StatBox label="حضور هذا الشهر" value={thisMonthAttendance} color="emerald" />
          <StatBox label="النقاط"          value={student.points}      color="amber" />
        </div>

        {/* ── Info + Edit ─────────────────────────────── */}
        <div className="card p-5">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-blue-700" />
              بياناتي
            </h3>

            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <Pencil size={13} /> تعديل البيانات
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-all"
              >
                <X size={13} /> إلغاء
              </button>
            )}
          </div>

          {/* ── VIEW mode ── */}
          {!editing ? (
            <div className="space-y-2.5">
              <InfoRow icon={<BookOpen size={14} />} label="الصف"           value={student.stage} />
              <InfoRow icon={<Phone size={14} />}    label="الهاتف"         value={student.phone} />
              <InfoRow icon={<Phone size={14} />}    label="ولي الأمر"      value={student.parent_phone} />
              {student.birthday  && <InfoRow icon={<Calendar size={14} />} label="الميلاد"        value={formatDate(student.birthday)} />}
              {student.confessor && <InfoRow icon={<User size={14} />}     label="الأب الاعترافي" value={student.confessor} />}
            </div>

          ) : (
          /* ── EDIT mode ── */
            <div className="space-y-3">
              <div>
                <label className="label">رقم هاتفك *</label>
                <input type="tel" className="input text-sm" value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  maxLength={11} dir="ltr" inputMode="numeric" />
              </div>
              <div>
                <label className="label">رقم هاتف ولي الأمر *</label>
                <input type="tel" className="input text-sm" value={editForm.parent_phone}
                  onChange={e => setEditForm(p => ({ ...p, parent_phone: e.target.value }))}
                  maxLength={11} dir="ltr" inputMode="numeric" />
              </div>
              <div>
                <label className="label">الصف الدراسي *</label>
                <select className="select text-sm" value={editForm.stage}
                  onChange={e => setEditForm(p => ({ ...p, stage: e.target.value }))}>
                  <optgroup label="إعدادي">
                    {STAGES.filter(s => s.group === 'إعدادي').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="ثانوي">
                    {STAGES.filter(s => s.group === 'ثانوي').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="label">الأب الاعترافي</label>
                <input type="text" className="input text-sm" value={editForm.confessor}
                  onChange={e => setEditForm(p => ({ ...p, confessor: e.target.value }))}
                  placeholder="اختياري" />
              </div>

              <button onClick={saveEdit} disabled={saving} className="btn-success w-full mt-2">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save size={15} />
                }
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          )}
        </div>

        {/* ── QR Code ────────────────────────────────── */}
        {student.qr_code && (
          <div className="card p-5 flex flex-col items-center gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 self-start">
              <QrCode size={16} className="text-blue-700" /> QR Code الخاص بي
            </h3>
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <QRCode value={student.qr_code} size={180} />
            </div>
            <p className="text-xs text-slate-400 text-center">
              أرِ هذا الكود للمشرف عند الحضور يوم الأحد
            </p>
          </div>
        )}

        {/* ── Attendance ──────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Clock size={16} className="text-blue-700" /> سجل الحضور
          </h3>
          {attendance.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">لا يوجد حضور مسجل بعد</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {attendance.slice(0, 20).map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
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

        {/* ── Points Log ──────────────────────────────── */}
        {logs.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Star size={16} className="text-amber-500" /> سجل النقاط
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

// ── Helper Components ─────────────────────────────────────
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
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="text-slate-400 flex-shrink-0">{icon}</span>
      <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
