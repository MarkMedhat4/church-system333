// ============================================================
// /registrations — Pending Student Approvals
// ============================================================

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentPhoto from '@/components/ui/StudentPhoto';
import Modal from '@/components/ui/Modal';
import { SkeletonStudentCard } from '@/components/skeletons';
import { usePendingStudents } from '@/hooks/useStudents';
import { approveStudent, rejectStudent } from '@/services/students';
import { formatDate, formatDateTime } from '@/services/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { Student } from '@/types';
import {
  CheckCircle, XCircle, Eye, Phone,
  Calendar, BookOpen, UserCheck, ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegistrationsPage() {
  const { students, loading, refresh } = usePendingStudents();
  const [selected, setSelected] = useState<Student | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleApprove(student_code: string) {
    setActionLoading(student_code + '-approve');
    const res = await approveStudent(student_code);
    setActionLoading(null);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('تم قبول الطالب وإنشاء QR تلقائياً ✅');
      setSelected(null);
      refresh();
    }
  }

  async function handleReject(student_code: string) {
    setActionLoading(student_code + '-reject');
    const res = await rejectStudent(student_code);
    setActionLoading(null);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('تم رفض الطالب');
      setSelected(null);
      refresh();
    }
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <ClipboardList className="text-blue-700" size={24} />
              طلبات التسجيل
            </h1>
            {!loading && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {students.length > 0
                  ? `${students.length} طلب في الانتظار`
                  : 'لا توجد طلبات معلقة'}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStudentCard key={i} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="card p-12 text-center">
            <UserCheck size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">
              لا توجد طلبات معلقة
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              كل الطلبات تمت مراجعتها 🎉
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map(student => (
              <div key={student.student_code} className="card p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in">
                {/* Top: Photo + Name */}
                <div className="flex items-start gap-3 mb-4">
                  <StudentPhoto photoUrl={student.photo_url} name={student.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {student.student_code}
                    </p>
                    <span className={`badge mt-1.5 ${STATUS_COLORS[student.status]}`}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <InfoRow icon={<Phone size={14} />} label="الهاتف" value={student.phone} />
                  <InfoRow icon={<Phone size={14} />} label="ولي الأمر" value={student.parent_phone} />
                  <InfoRow icon={<BookOpen size={14} />} label="الصف" value={student.stage} />
                  {student.birthday && (
                    <InfoRow icon={<Calendar size={14} />} label="الميلاد" value={formatDate(student.birthday)} />
                  )}
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  سُجِّل: {formatDateTime(student.created_at)}
                </p>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelected(student)}
                    className="btn-outline text-xs py-2 col-span-1"
                  >
                    <Eye size={14} />
                    عرض
                  </button>
                  <button
                    onClick={() => handleApprove(student.student_code)}
                    disabled={actionLoading === student.student_code + '-approve'}
                    className="btn-success text-xs py-2 col-span-1"
                  >
                    {actionLoading === student.student_code + '-approve' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <CheckCircle size={14} />}
                    قبول
                  </button>
                  <button
                    onClick={() => handleReject(student.student_code)}
                    disabled={actionLoading === student.student_code + '-reject'}
                    className="btn-danger text-xs py-2 col-span-1"
                  >
                    {actionLoading === student.student_code + '-reject' ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <XCircle size={14} />}
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="بيانات الطالب"
        size="md"
      >
        {selected && (
          <div className="space-y-5">
            {/* Photo + Name */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
              <StudentPhoto photoUrl={selected.photo_url} name={selected.name} size="xl" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{selected.student_code}</p>
              </div>
            </div>

            {/* Full Details */}
            <div className="space-y-3">
              <DetailRow label="الصف الدراسي"    value={selected.stage} />
              <DetailRow label="رقم الهاتف"       value={selected.phone} />
              <DetailRow label="هاتف ولي الأمر"   value={selected.parent_phone} />
              {selected.birthday   && <DetailRow label="تاريخ الميلاد"  value={formatDate(selected.birthday)} />}
              {selected.confessor  && <DetailRow label="الأب الاعترافي" value={selected.confessor} />}
              <DetailRow label="تاريخ التسجيل"   value={formatDateTime(selected.created_at)} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selected.student_code)}
                disabled={!!actionLoading}
                className="btn-success flex-1"
              >
                <CheckCircle size={16} /> قبول الطالب
              </button>
              <button
                onClick={() => handleReject(selected.student_code)}
                disabled={!!actionLoading}
                className="btn-danger flex-1"
              >
                <XCircle size={16} /> رفض الطلب
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

// ── Helper Components ──────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 flex-shrink-0">{icon}</span>
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700/50">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
