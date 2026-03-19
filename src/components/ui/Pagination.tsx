// ============================================================
// Pagination Component
// ============================================================

'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/services/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
}

export default function Pagination({
  page, totalPages, onPageChange,
  showInfo = true, totalItems, pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      {/* Info */}
      {showInfo && totalItems !== undefined && pageSize !== undefined && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          عرض{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {Math.min((page - 1) * pageSize + 1, totalItems)}–{Math.min(page * pageSize, totalItems)}
          </span>
          {' '}من{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {totalItems}
          </span>
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-all',
            page === 1
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
        >
          <ChevronRight size={16} />
        </button>

        {/* Page Numbers */}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium transition-all',
              p === page
                ? 'bg-blue-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-all',
            page === totalPages
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
