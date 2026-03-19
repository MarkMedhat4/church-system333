// ============================================================
// AdminLayout — Wraps all admin pages
// ============================================================

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell } from 'lucide-react';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useRequireAdmin } from '@/hooks/useAuth';
import { usePendingStudents } from '@/hooks/useStudents';

// Page title map
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'لوحة التحكم',
  '/registrations': 'طلبات التسجيل',
  '/students':      'إدارة الطلاب',
  '/scanner':       'مسح QR',
  '/points':        'النقاط',
  '/id-cards':      'بطاقات الهوية',
  '/reports':       'التقارير',
  '/import':        'استيراد البيانات',
  '/settings':      'الإعدادات',
};

function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
      title="تبديل الوضع"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useRequireAdmin();
  const pathname = usePathname();
  const { count: pendingCount } = usePendingStudents();

  // Determine current page title
  const pageTitle = PAGE_TITLES[pathname] || 'لوحة التحكم';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null; // Redirecting

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:mr-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left side: Mobile menu space + Title */}
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" /> {/* Space for mobile menu button */}
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2">
              {/* Pending notifications */}
              {pendingCount > 0 && (
                <a
                  href="/registrations"
                  className="relative p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-all"
                >
                  <Bell size={18} />
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                </a>
              )}

              <DarkModeToggle />

              {/* Admin name */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700">
                <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {admin?.name?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {admin?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800">
          كنيسة الثلاثة فتية القديسين — أسوان © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
