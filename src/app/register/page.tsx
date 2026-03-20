// ============================================================
// /register — تسجيل طالب جديد (3 خطوات) مع تحقق صارم
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { registerStudent } from '@/services/students';
import { isValidEgyptianPhone } from '@/services/utils';
import { STAGES, APP_CONFIG } from '@/lib/constants';
import { StudentRegistrationForm } from '@/types';
import {
  User, BookOpen, Camera, Check,
  ChevronLeft, AlertCircle, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Step config ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'البيانات الشخصية', icon: User },
  { id: 2, label: 'البيانات الدراسية', icon: BookOpen },
  { id: 3, label: 'الصورة الشخصية',   icon: Camera },
];

const INITIAL_FORM: StudentRegistrationForm = {
  name: '', phone: '', parent_phone: '', birthday: '',
  stage: '', confessor: '', photo: null,
};

// ── Validators ────────────────────────────────────────────

/** الاسم لازم يكون 3 كلمات على الأقل */
function isTripleName(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 3 && parts.every(p => p.length >= 2);
}

/** التاريخ لازم يكون منطقي (بين 1990 و 2015) */
function isValidBirthday(date: string): boolean {
  if (!date) return false;
  const d = new Date(date);
  const year = d.getFullYear();
  return year >= 1990 && year <= 2015;
}

// ── Error message component ───────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 mt-1.5">
      <AlertCircle size={12} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

// ── Main Component ────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]                   = useState(1);
  const [form, setForm]                   = useState<StudentRegistrationForm>(INITIAL_FORM);
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [studentCode, setStudentCode]     = useState('');
  const [errors, setErrors]               = useState<Record<string, string>>({});

  function update(key: keyof StudentRegistrationForm, value: string | File | null) {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [key]: '' }));
  }

  // ── Validate Step 1 ───────────────────────────────────
  function validateStep1(): Record<string, string> {
    const e: Record<string, string> = {};

    if (!form.name.trim()) {
      e.name = 'الاسم مطلوب';
    } else if (!isTripleName(form.name)) {
      e.name = 'يجب إدخال الاسم الثلاثي على الأقل (3 كلمات)';
    }

    if (!form.phone.trim()) {
      e.phone = 'رقم الهاتف مطلوب';
    } else if (!isValidEgyptianPhone(form.phone.trim())) {
      e.phone = 'رقم غير صحيح — يجب أن يبدأ بـ 01 ويكون 11 رقم';
    }

    if (!form.parent_phone.trim()) {
      e.parent_phone = 'رقم هاتف ولي الأمر مطلوب';
    } else if (!isValidEgyptianPhone(form.parent_phone.trim())) {
      e.parent_phone = 'رقم غير صحيح — يجب أن يبدأ بـ 01 ويكون 11 رقم';
    }

    if (form.phone.trim() === form.parent_phone.trim()) {
      e.parent_phone = 'رقم ولي الأمر يجب أن يكون مختلفاً عن رقمك';
    }

    if (!form.birthday) {
      e.birthday = 'تاريخ الميلاد مطلوب';
    } else if (!isValidBirthday(form.birthday)) {
      e.birthday = 'تاريخ الميلاد غير منطقي — تأكد من الإدخال الصحيح';
    }

    return e;
  }

  // ── Validate Step 2 ───────────────────────────────────
  function validateStep2(): Record<string, string> {
    const e: Record<string, string> = {};

    if (!form.stage) {
      e.stage = 'الصف الدراسي مطلوب';
    }

    if (!form.confessor.trim()) {
      e.confessor = 'اسم الأب الاعترافي مطلوب — اكتب "ليسا" أو "لا يوجد" إن لم يكن لديك';
    } else if (form.confessor.trim().length < 3) {
      e.confessor = 'يرجى كتابة اسم الأب الاعترافي كاملاً';
    }

    return e;
  }

  // ── Navigation ────────────────────────────────────────
  function goNext() {
    let errs: Record<string, string> = {};

    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('يرجى تصحيح الأخطاء أولاً');
      return;
    }

    setErrors({});
    setStep(s => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep(s => s - 1);
  }

  // ── Photo ─────────────────────────────────────────────
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

  // ── Submit ────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    const result = await registerStudent(form);
    setLoading(false);

    if (result.error) {
      // رقم مسجل مسبقاً — ارجع لخطوة 1 وأظهر الخطأ
      if (result.error.includes('مسجل بالفعل')) {
        setStep(1);
        setErrors({ phone: 'هذا الرقم مسجل بالفعل في النظام — سجّل دخولك أو استخدم رقماً آخر' });
        toast.error('رقم الهاتف مسجل مسبقاً');
      } else {
        toast.error(result.error);
      }
    } else {
      setStudentCode(result.data?.student_code || '');
      setSubmitted(true);
    }
  }

  // ── Success screen ────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تم التسجيل بنجاح! 🎉</h2>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            طلبك قيد المراجعة. سيتم قبولك من قِبَل المشرف قريباً.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-6">
            <p className="text-xs text-slate-500 mb-1">رقم طلبك</p>
            <p className="text-blue-800 dark:text-blue-400 font-bold font-mono text-lg tracking-wider">
              {studentCode}
            </p>
          </div>
          <button onClick={() => router.push('/student-login')} className="btn-primary w-full">
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Header ─────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-2xl">✝</span>
          </div>
          <h1 className="text-white text-xl font-bold">{APP_CONFIG.NAME}</h1>
          <p className="text-blue-300 text-sm">تسجيل طالب جديد</p>
        </div>

        {/* ── Step Indicator ──────────────────────────── */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, idx) => {
            const Icon     = s.icon;
            const isActive = s.id === step;
            const isDone   = s.id < step;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive ? 'bg-amber-500 border-amber-400 text-white' :
                    isDone   ? 'bg-emerald-500 border-emerald-400 text-white' :
                               'bg-transparent border-blue-400 text-blue-300'
                  }`}>
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

        {/* ── Form Card ───────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {STEPS[step - 1].label}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
            الخطوة {step} من {STEPS.length}
          </p>

          <form onSubmit={e => e.preventDefault()} className="space-y-4">

            {/* ══ STEP 1 — البيانات الشخصية ══════════════ */}
            {step === 1 && (
              <>
                {/* Name */}
                <div>
                  <label className="label">
                    الاسم الثلاثي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="مثال: يوسف مارك أنطون"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                  />
                  {errors.name && <FieldError msg={errors.name} />}
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info size={11} /> يجب إدخال 3 كلمات على الأقل
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="label">
                    رقم هاتفك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`input ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    maxLength={11}
                    dir="ltr"
                    inputMode="numeric"
                  />
                  {errors.phone && <FieldError msg={errors.phone} />}
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="label">
                    رقم هاتف ولي الأمر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`input ${errors.parent_phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="01XXXXXXXXX"
                    value={form.parent_phone}
                    onChange={e => update('parent_phone', e.target.value)}
                    maxLength={11}
                    dir="ltr"
                    inputMode="numeric"
                  />
                  {errors.parent_phone && <FieldError msg={errors.parent_phone} />}
                </div>

                {/* Birthday */}
                <div>
                  <label className="label">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`input ${errors.birthday ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={form.birthday}
                    onChange={e => update('birthday', e.target.value)}
                    max="2015-12-31"
                    min="1990-01-01"
                  />
                  {errors.birthday && <FieldError msg={errors.birthday} />}
                </div>
              </>
            )}

            {/* ══ STEP 2 — البيانات الدراسية ═════════════ */}
            {step === 2 && (
              <>
                {/* Stage */}
                <div>
                  <label className="label">
                    الصف الدراسي <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`select ${errors.stage ? 'border-red-400 focus:ring-red-400' : ''}`}
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
                  {errors.stage && <FieldError msg={errors.stage} />}
                </div>

                {/* Confessor */}
                <div>
                  <label className="label">
                    اسم الأب الاعترافي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.confessor ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder='مثال: أبونا يوحنا — أو اكتب "ليسا" / "لا يوجد"'
                    value={form.confessor}
                    onChange={e => update('confessor', e.target.value)}
                  />
                  {errors.confessor && <FieldError msg={errors.confessor} />}
                  <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <Info size={12} className="flex-shrink-0 mt-0.5" />
                      إذا لم يكن لديك أب اعترافي اكتب:{' '}
                      <button
                        type="button"
                        onClick={() => update('confessor', 'ليسا')}
                        className="font-bold underline hover:no-underline"
                      >
                        ليسا
                      </button>
                      {' '}أو{' '}
                      <button
                        type="button"
                        onClick={() => update('confessor', 'لا يوجد')}
                        className="font-bold underline hover:no-underline"
                      >
                        لا يوجد
                      </button>
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ══ STEP 3 — الصورة (اختياري) ══════════════ */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-1.5">
                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                    الصورة الشخصية <strong>اختيارية</strong> — يمكنك إضافتها لاحقاً من صفحة بروفايلك
                  </p>
                </div>

                {/* Upload area */}
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-36 h-36">
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
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✅ تم اختيار الصورة
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl">
                    <Camera size={36} className="text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                      اختر صورة (اختياري)
                    </span>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        e.stopPropagation();
                        handlePhoto(e.target.files?.[0] || null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        document.getElementById('photo-input')?.click();
                      }}
                      className="btn-outline text-sm py-2 px-4"
                    >
                      <Camera size={14} /> اختر من الجهاز
                    </button>
                  </div>
                )}

                {/* Summary before submit */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    ملخص البيانات:
                  </p>
                  {[
                    { label: 'الاسم',        value: form.name },
                    { label: 'الهاتف',       value: form.phone },
                    { label: 'ولي الأمر',    value: form.parent_phone },
                    { label: 'الصف',         value: form.stage },
                    { label: 'الأب الاعترافي', value: form.confessor },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[60%] text-left truncate">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ─────────────────── */}
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
                  type="button"
                  onClick={handleSubmit}
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

        {/* Login link */}
        <div className="text-center mt-4">
          <p className="text-blue-300 text-sm">
            عندك حساب بالفعل؟{' '}
            <a href="/student-login" className="text-amber-400 font-semibold hover:underline">
              سجّل دخول
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
