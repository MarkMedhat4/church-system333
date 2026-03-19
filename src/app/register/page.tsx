// ============================================================
// /register — 3-Step Student Registration
// ============================================================

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, BookOpen, Camera, Check, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { registerStudent } from '@/services/students';
import { isValidEgyptianPhone } from '@/services/utils';
import { STAGES, APP_CONFIG } from '@/lib/constants';
import { StudentRegistrationForm } from '@/types';

const STEPS = [
  { id: 1, label: 'البيانات الشخصية', icon: User },
  { id: 2, label: 'البيانات الدراسية', icon: BookOpen },
  { id: 3, label: 'الصورة الشخصية',   icon: Camera },
];

const INITIAL_FORM: StudentRegistrationForm = {
  name: '', phone: '', parent_phone: '', birthday: '',
  stage: '', confessor: '', photo: null,
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentRegistrationForm>(INITIAL_FORM);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentCode, setStudentCode] = useState('');

  const update = (key: keyof StudentRegistrationForm, value: string | File | null) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Step Validation ────────────────────────────────────
  function validateStep1(): string | null {
    if (!form.name.trim()) return 'يرجى إدخال الاسم';
    if (!isValidEgyptianPhone(form.phone)) return 'رقم الهاتف غير صحيح (01XXXXXXXXX)';
    if (!isValidEgyptianPhone(form.parent_phone)) return 'رقم هاتف ولي الأمر غير صحيح';
    return null;
  }

  function validateStep2(): string | null {
    if (!form.stage) return 'يرجى اختيار الصف الدراسي';
    return null;
  }

  // ── Navigation ─────────────────────────────────────────
  function goNext() {
    let err: string | null = null;
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (err) { toast.error(err); return; }
    setStep(s => s + 1);
  }

  function goBack() { setStep(s => s - 1); }

  // ── Photo Handler ──────────────────────────────────────
  function handlePhoto(file: File | null) {
    update('photo', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  // ── Submit ─────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await registerStudent(form);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setStudentCode(result.data?.student_code || '');
      setSubmitted(true);
    }
  }

  // ── Success Screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            تم التسجيل بنجاح! 🎉
          </h2>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            طلبك قيد المراجعة. سيتم قبولك من قِبَل المشرف قريباً.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-6">
            <p className="text-xs text-slate-500 mb-1">رقم طلبك</p>
            <p className="text-blue-800 dark:text-blue-400 font-bold font-mono text-lg tracking-wider">
              {studentCode}
            </p>
          </div>
          <button
            onClick={() => router.push('/student-login')}
            className="btn-primary w-full"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-2xl">✝</span>
          </div>
          <h1 className="text-white text-xl font-bold">{APP_CONFIG.NAME}</h1>
          <p className="text-blue-300 text-sm">تسجيل طالب جديد</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 gap-0">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`
                  flex flex-col items-center gap-1
                  ${isActive ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-40'}
                `}>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isActive ? 'bg-amber-500 border-amber-400 text-white' :
                      isDone  ? 'bg-emerald-500 border-emerald-400 text-white' :
                                'bg-transparent border-blue-400 text-blue-300'}
                  `}>
                    {isDone ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="text-xs text-blue-200 hidden sm:block">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${isDone ? 'bg-emerald-400' : 'bg-blue-600'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
            {STEPS[step - 1].label}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <div>
                  <label className="label">الاسم الكامل *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="الاسم الرباعي"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">رقم هاتفك *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    maxLength={11}
                    dir="ltr"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="label">رقم هاتف ولي الأمر *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="01XXXXXXXXX"
                    value={form.parent_phone}
                    onChange={e => update('parent_phone', e.target.value)}
                    maxLength={11}
                    dir="ltr"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="label">تاريخ الميلاد</label>
                  <input
                    type="date"
                    className="input"
                    value={form.birthday}
                    onChange={e => update('birthday', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <div>
                  <label className="label">الصف الدراسي *</label>
                  <select
                    className="select"
                    value={form.stage}
                    onChange={e => update('stage', e.target.value)}
                  >
                    <option value="">اختر الصف</option>
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
                  <label className="label">اسم الأب الاعترافي</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="اختياري"
                    value={form.confessor}
                    onChange={e => update('confessor', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  {photoPreview ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={photoPreview}
                        alt="صورة الطالب"
                        fill
                        className="rounded-2xl object-cover shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhoto(null)}
                        className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors">
                      <Camera size={32} className="text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">انقر لرفع صورة</span>
                      <span className="text-xs text-slate-400 mt-1">JPG, PNG (اختياري)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handlePhoto(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-center text-slate-400">
                  الصورة اختيارية. يمكن إضافتها لاحقاً.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-outline flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  السابق
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-primary flex-1"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-success flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      إرسال الطلب
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
