// ============================================================
// /student-login — Student Login (phone number)
// ============================================================

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudentAuth } from '@/hooks/useAuth';
import { isValidEgyptianPhone } from '@/services/utils';
import { APP_CONFIG } from '@/lib/constants';

export default function StudentLoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStudentAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (!isValidEgyptianPhone(cleanPhone)) {
      toast.error('يرجى إدخال رقم هاتف مصري صحيح (01XXXXXXXXX)');
      return;
    }

    setLoading(true);
    const result = await login(cleanPhone);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`أهلاً بك يا ${result.data?.name}!`);
      router.push('/profile');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-amber-400 text-3xl font-bold">✝</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">مرحباً بك</h1>
            <p className="text-slate-500 text-sm mt-1">{APP_CONFIG.NAME}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="tel"
                  className="input pl-4 pr-11"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={11}
                  dir="ltr"
                  inputMode="numeric"
                />
                <Phone
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                أدخل رقم هاتفك المسجل في الكنيسة
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  دخول
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              مش مسجل عندنا؟
            </p>
            <a
              href="/register"
              className="text-sm text-blue-700 dark:text-blue-400 hover:underline font-semibold"
            >
              سجّل بياناتك الآن ←
            </a>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-4">
          <a href="/login" className="text-blue-300 text-xs hover:underline">
            دخول المشرفين
          </a>
        </div>
      </div>
    </div>
  );
}
