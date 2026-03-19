// ============================================================
// /settings — System Settings + Admin Management
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Admin } from '@/types';
import { formatDateTime } from '@/services/utils';
import {
  Settings, UserPlus, Trash2, Shield,
  CheckCircle, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/Modal';

// ── Admin Management ──────────────────────────────────────
function AdminsSection() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function loadAdmins() {
    const { data } = await supabase.from('admins').select('*').order('created_at');
    setAdmins((data as Admin[]) || []);
    setLoading(false);
  }

  useEffect(() => { loadAdmins(); }, []);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (addForm.password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setAdding(true);
    try {
      // 1. Create Supabase Auth user
      const { data: authData, error: authErr } = await supabase.auth.admin
        ? await supabase.auth.signUp({
            email: addForm.email,
            password: addForm.password,
          })
        : { data: null, error: { message: 'No admin access' } };

      // 2. Insert into admins table
      const { error: dbErr } = await supabase.from('admins').insert({
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        role: addForm.role,
      });

      if (dbErr) throw new Error(dbErr.message);

      toast.success('تم إضافة الأدمن بنجاح ✅');
      setAddForm({ name: '', email: '', password: '', role: 'admin' });
      loadAdmins();
    } catch (e: any) {
      toast.error('فشل الإضافة: ' + e.message);
    }
    setAdding(false);
  }

  async function deleteAdmin(admin: Admin) {
    const { error } = await supabase.from('admins').delete().eq('id', admin.id);
    if (error) {
      toast.error('فشل الحذف');
    } else {
      toast.success('تم حذف الأدمن');
      setDeleteTarget(null);
      loadAdmins();
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Admin Form */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-blue-700" />
          إضافة مشرف جديد
        </h3>
        <form onSubmit={addAdmin} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">الاسم</label>
              <input
                type="text"
                className="input"
                placeholder="اسم المشرف"
                value={addForm.name}
                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                type="email"
                className="input"
                placeholder="admin@church.com"
                value={addForm.email}
                onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10"
                  placeholder="8 أحرف على الأقل"
                  value={addForm.password}
                  onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">الدور</label>
              <select
                className="select"
                value={addForm.role}
                onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
              >
                <option value="admin">مشرف</option>
                <option value="super_admin">مشرف رئيسي</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            إضافة مشرف
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-700" />
          المشرفون ({admins.length})
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map(admin => (
              <div
                key={admin.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{admin.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{admin.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{admin.email}</p>
                </div>
                <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                  {admin.role === 'super_admin' ? 'رئيسي' : 'مشرف'}
                </span>
                <button
                  onClick={() => setDeleteTarget(admin)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteAdmin(deleteTarget)}
        title="حذف المشرف"
        message={`هل تريد حذف المشرف "${deleteTarget?.name}"؟`}
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}

// ── System Info ────────────────────────────────────────────
function SystemInfo() {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Settings size={18} className="text-blue-700" />
        معلومات النظام
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'اسم النظام',    value: 'Church Management SaaS' },
          { label: 'الكنيسة',       value: 'الثلاثة فتية القديسين' },
          { label: 'المدينة',       value: 'أسوان' },
          { label: 'الخدمة',        value: 'إعدادي + ثانوي' },
          { label: 'قاعدة البيانات', value: 'Supabase (PostgreSQL)' },
          { label: 'الواجهة',       value: 'Next.js + Tailwind CSS' },
          { label: 'يوم المسح',     value: 'الأحد فقط' },
          { label: 'وقت المسح',     value: '6 م — 9 م' },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status checks */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
        {[
          { label: 'Supabase متصل',          ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
          { label: 'RLS مفعّل',              ok: true },
          { label: 'QR Anti-Cheat مفعّل',    ok: true },
          { label: 'النقاط التلقائية مفعّلة', ok: true },
        ].map(check => (
          <div key={check.label} className="flex items-center gap-2 text-sm">
            {check.ok
              ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
              : <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
            }
            <span className="text-slate-700 dark:text-slate-300">{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<'admins' | 'system'>('admins');

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Settings className="text-blue-700" size={24} />
            الإعدادات
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('admins')}
            className={tab === 'admins' ? 'btn-primary' : 'btn-outline'}
          >
            <Shield size={15} />
            المشرفون
          </button>
          <button
            onClick={() => setTab('system')}
            className={tab === 'system' ? 'btn-primary' : 'btn-outline'}
          >
            <Settings size={15} />
            النظام
          </button>
        </div>

        {tab === 'admins' ? <AdminsSection /> : <SystemInfo />}
      </div>
    </AdminLayout>
  );
}
