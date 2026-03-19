// ============================================================
// /students — Students Management
// ============================================================

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentPhoto from '@/components/ui/StudentPhoto';
import Modal from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTable } from '@/components/skeletons';
import { useStudents } from '@/hooks/useStudents';
import { formatDate, formatDateTime } from '@/services/utils';
import { STAGES, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { Student, StudentStatus } from '@/types';
import {
  Users, Search, Filter, Eye, Trash2,
  QrCode, Star, Phone, BookOpen, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

export default function StudentsPage() {
  const {
    students, loading, result, filters, pagination,
    setFilters, changePage, approve, reject, remove,
  } = useStudents({ status: 'all' });

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Apply search with debounce feel (on form submit)
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters({ ...filters, search: search.trim() });
  }

  function handleFilterChange(key: string, value: string) {
    setFilters({ ...filters, [key]: value === 'all' ? undefined : value, search: search });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await remove(deleteTarget.student_code);
    setDeleteLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('تم حذف الطالب');
      setDeleteTarget(null);
      setSelectedStudent(null);
    }
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Users className="text-blue-700" size={24} />
            الطلاب
            {result && (
              <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {result.count}
              </span>
            )}
          </h1>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
              <input
                type="text"
                className="input flex-1 text-sm py-2"
                placeholder="بحث بالاسم أو الهاتف أو الكود..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-primary py-2 px-4">
                <Search size={16} />
              </button>
            </form>

            {/* Stage Filter */}
            <select
              className="select text-sm py-2 w-44"
              value={filters.stage || 'all'}
              onChange={e => handleFilterChange('stage', e.target.value)}
            >
              <option value="all">كل الصفوف</option>
              {STAGES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="select text-sm py-2 w-40"
              value={filters.status || 'all'}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="1">مقبول</option>
              <option value="0">في الانتظار</option>
              <option value="-1">مرفوض</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={10} cols={6} />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الصف</th>
                    <th>الهاتف</th>
                    <th>النقاط</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : students.map(student => (
                    <tr key={student.student_code}>
                      <td>
                        <div className="flex items-center gap-3">
                          <StudentPhoto photoUrl={student.photo_url} name={student.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              {student.student_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {student.stage}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {student.phone}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                          <Star size={12} className="text-amber-400" />
                          {student.points}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[student.status]}`}>
                          {STATUS_LABELS[student.status]}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-700 transition-all"
                            title="عرض"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                            title="حذف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {result && (
              <Pagination
                page={pagination.page}
                totalPages={result.totalPages}
                onPageChange={changePage}
                totalItems={result.count}
                pageSize={pagination.pageSize}
              />
            )}
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="بيانات الطالب"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <StudentPhoto photoUrl={selectedStudent.photo_url} name={selectedStudent.name} size="xl" />
              <div className="text-center sm:text-right">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                <p className="text-slate-500 font-mono text-sm">{selectedStudent.student_code}</p>
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className={`badge ${STATUS_COLORS[selectedStudent.status]}`}>
                    {STATUS_LABELS[selectedStudent.status]}
                  </span>
                  <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {selectedStudent.points} نقطة
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {selectedStudent.qr_code && (
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <QRCode value={selectedStudent.qr_code} size={140} />
                <p className="text-xs text-slate-500 font-mono">{selectedStudent.qr_code.slice(0, 20)}...</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="الصف" value={selectedStudent.stage} />
              <InfoItem label="الهاتف" value={selectedStudent.phone} />
              <InfoItem label="هاتف ولي الأمر" value={selectedStudent.parent_phone} />
              {selectedStudent.birthday && <InfoItem label="الميلاد" value={formatDate(selectedStudent.birthday)} />}
              {selectedStudent.confessor && <InfoItem label="الأب الاعترافي" value={selectedStudent.confessor} />}
              <InfoItem label="تاريخ التسجيل" value={formatDateTime(selectedStudent.created_at)} />
            </div>

            {/* Delete */}
            <button
              onClick={() => { setSelectedStudent(null); setDeleteTarget(selectedStudent); }}
              className="btn-danger w-full"
            >
              <Trash2 size={16} />
              حذف الطالب
            </button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الطالب "${deleteTarget?.name}"؟ سيتم حذف جميع بياناته بشكل دائم.`}
        confirmText="حذف"
        loading={deleteLoading}
        variant="danger"
      />
    </AdminLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}
