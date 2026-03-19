// ============================================================
// Modal — Reusable Dialog Component
// ============================================================

'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/services/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

const SIZE_CLASSES = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-2xl',
};

export default function Modal({
  open, onClose, title, children,
  size = 'md', showClose = true,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl',
          'border border-slate-100 dark:border-slate-700',
          'animate-slide-up',
          SIZE_CLASSES[size]
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
            {title && (
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success';
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmText = 'تأكيد', cancelText = 'إلغاء',
  variant = 'danger', loading = false,
}: ConfirmModalProps) {
  const BUTTON_CLASSES = {
    danger:  'btn-danger',
    warning: 'btn-gold',
    success: 'btn-success',
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline" disabled={loading}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={BUTTON_CLASSES[variant]}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
