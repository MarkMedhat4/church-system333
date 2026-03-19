// ============================================================
// /points — Points Management + Leaderboard
// ============================================================

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentPhoto from '@/components/ui/StudentPhoto';
import Modal from '@/components/ui/Modal';
import { SkeletonLeaderboard, SkeletonTable } from '@/components/skeletons';
import { usePoints } from '@/hooks/usePoints';
import { useStudents } from '@/hooks/useStudents';
import { fetchLeaderboard } from '@/services/students';
import { formatDate, formatDateTime } from '@/services/utils';
import { POINT_REASONS } from '@/lib/constants';
import { Student } from '@/types';
import { Star, Trophy, Plus, Minus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function PointsPage() {
  const { logs, loading: logsLoading, add, deduct } = usePoints();
  const { students } = useStudents({ status: '1' });
  const [leaderboard, setLeaderboard] = useState<Student[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'deduct'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [points, setPoints] = useState('1');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  // Fetch leaderboard
  useEffect(() => {
    fetchLeaderboard(10).then(({ data }) => {
      setLeaderboard(data || []);
      setLbLoading(false);
    });
  }, [logs]); // Refresh when logs change

  function openModal(student: Student, type: 'add' | 'deduct') {
    setSelectedStudent(student);
    setModalType(type);
    setPoints('1');
    setReason('');
    setCustomReason('');
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!selectedStudent) return;
    const finalReason = reason === 'أخرى' ? customReason.trim() : reason;
    if (!finalReason) { toast.error('يرجى اختيار السبب'); return; }
    const pts = parseInt(points);
    if (!pts || pts <= 0) { toast.error('يرجى إدخال عدد نقاط صحيح'); return; }

    setSubmitting(true);
    const res = modalType === 'add'
      ? await add(selectedStudent.student_code, selectedStudent.name, pts, finalReason)
      : await deduct(selectedStudent.student_code, selectedStudent.name, pts, finalReason);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(modalType === 'add' ? `تمت إضافة ${pts} نقطة ✅` : `تم خصم ${pts} نقطة`);
      setModalOpen(false);
    }
  }

  const filteredStudents = students.filter(s =>
    !searchStudent || s.name.includes(searchStudent) || s.phone.includes(searchStudent)
  );

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <AdminLayout>
      <div className="animate-fade-in">

        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Star className="text-amber-500" size={24} />
            النقاط
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Leaderboard ─────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              المتصدرون
            </h3>
            {lbLoading ? <SkeletonLeaderboard /> : (
              <div className="space-y-2">
                {leaderboard.map((student, idx) => (
                  <div
                    key={student.student_code}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">
                      {idx < 3 ? medals[idx] : `${idx + 1}`}
                    </span>
                    <StudentPhoto photoUrl={student.photo_url} name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{student.stage}</p>
                    </div>
                    <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg">
                      {student.points} ★
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Student Search + Actions ─────────────────────── */}
          <div className="lg:col-span-2 card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              إضافة / خصم نقاط
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                className="input pr-10 text-sm"
                placeholder="ابحث عن طالب..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto space-y-1.5">
              {filteredStudents.slice(0, 20).map(student => (
                <div
                  key={student.student_code}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <StudentPhoto photoUrl={student.photo_url} name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-400">{student.stage}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600 w-14 text-center">
                    {student.points} ★
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openModal(student, 'add')}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-all"
                      title="إضافة نقطة"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => openModal(student, 'deduct')}
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-all"
                      title="خصم نقطة"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Points Log ──────────────────────────────────────── */}
        <div className="card p-5 mt-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">سجل النقاط</h3>
          {logsLoading ? <SkeletonTable rows={6} cols={5} /> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>النقاط</th>
                    <th>السبب</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">لا توجد سجلات</td></tr>
                  ) : (
                    logs.slice(0, 50).map(log => (
                      <tr key={log.id}>
                        <td className="font-medium">{log.student_name}</td>
                        <td>
                          <span className={`font-bold ${log.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {log.points > 0 ? '+' : ''}{log.points}
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs">{log.reason}</td>
                        <td className="text-xs text-slate-400">{formatDate(log.date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Deduct Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${modalType === 'add' ? 'إضافة' : 'خصم'} نقاط — ${selectedStudent?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          {/* Points Input */}
          <div>
            <label className="label">عدد النقاط</label>
            <input
              type="number"
              min="1"
              max="100"
              className="input"
              value={points}
              onChange={e => setPoints(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="label">السبب</label>
            <select
              className="select"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="">اختر السبب</option>
              {POINT_REASONS.filter(r =>
                modalType === 'add' ? !r.startsWith('خصم') : r.startsWith('خصم') || r === 'أخرى'
              ).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {reason === 'أخرى' && (
            <div>
              <label className="label">تفاصيل السبب</label>
              <input
                type="text"
                className="input"
                placeholder="اكتب السبب..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={modalType === 'add' ? 'btn-success w-full' : 'btn-danger w-full'}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {modalType === 'add' ? <Plus size={16} /> : <Minus size={16} />}
                {modalType === 'add' ? 'إضافة' : 'خصم'} {points} نقطة
              </>
            )}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
