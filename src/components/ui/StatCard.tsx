// ============================================================
// StatCard — Dashboard Metric Widget
// ============================================================

'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/services/utils';
import { formatNumber } from '@/services/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'sky';
  trend?: { value: number; label: string };
  loading?: boolean;
  onClick?: () => void;
}

const COLOR_CLASSES = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'bg-blue-800 text-white',  text: 'text-blue-800 dark:text-blue-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-600 text-white', text: 'text-emerald-700 dark:text-emerald-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'bg-amber-500 text-white', text: 'text-amber-700 dark:text-amber-400' },
  red:     { bg: 'bg-red-50 dark:bg-red-900/20',      icon: 'bg-red-600 text-white',   text: 'text-red-700 dark:text-red-400' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-600 text-white', text: 'text-purple-700 dark:text-purple-400' },
  sky:     { bg: 'bg-sky-50 dark:bg-sky-900/20',      icon: 'bg-sky-600 text-white',   text: 'text-sky-700 dark:text-sky-400' },
};

export default function StatCard({
  label, value, icon: Icon, color = 'blue',
  trend, loading = false, onClick,
}: StatCardProps) {
  const colors = COLOR_CLASSES[color];

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-7 w-16 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'card p-5 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0', colors.icon)}>
          <Icon size={22} />
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
            {label}
          </p>
          <p className={cn('text-2xl font-bold leading-none', colors.text)}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-1 font-medium',
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
