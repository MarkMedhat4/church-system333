// ============================================================
// AdminSidebar — Main Navigation
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ClipboardList, Users, QrCode, Star,
  CreditCard, BarChart3, Upload, Settings, LogOut,
  ChevronRight, Menu, X, Bell,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAuth';
import { usePendingStudents } from '@/hooks/useStudents';
import { cn } from '@/services/utils';
import { APP_CONFIG } from '@/lib/constants';

const navItems = [
  { href: '/dashboard',     label: 'الرئيسية',       icon: LayoutDashboard },
  { href: '/registrations', label: 'طلبات التسجيل',  icon: ClipboardList,  badge: true },
  { href: '/students',      label: 'الطلاب',          icon: Users },
  { href: '/scanner',       label: 'مسح QR',          icon: QrCode },
  { href: '/points',        label: 'النقاط',          icon: Star },
  { href: '/id-cards',      label: 'بطاقات الهوية',  icon: CreditCard },
  { href: '/reports',       label: 'التقارير',        icon: BarChart3 },
  { href: '/import',        label: 'استيراد بيانات', icon: Upload },
  { href: '/settings',      label: 'الإعدادات',      icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const { count: pendingCount } = usePendingStudents();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">✝</span>
          </div>
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">الثلاثة فتية القديسين</p>
            <p className="text-blue-300 text-xs">خدمة الإعدادي والثانوي</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const showBadge = item.badge && pendingCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} className={cn(
                'flex-shrink-0 transition-colors',
                isActive ? 'text-amber-400' : 'text-blue-300 group-hover:text-amber-300'
              )} />
              <span className="text-sm font-medium flex-1">{item.label}</span>

              {/* Badge for pending registrations */}
              {showBadge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info + Logout */}
      <div className="p-3 border-t border-blue-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {admin?.name?.charAt(0) || 'أ'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{admin?.name || 'مدير'}</p>
            <p className="text-blue-300 text-xs truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-900 fixed top-0 right-0 h-full z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-blue-900 text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative w-64 bg-blue-900 h-full animate-slide-in mr-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 p-1.5 text-blue-300 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
