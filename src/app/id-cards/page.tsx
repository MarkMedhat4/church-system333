// ============================================================
// /id-cards — Student ID Card Generator + Print
// ============================================================

'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentPhoto from '@/components/ui/StudentPhoto';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTable } from '@/components/skeletons';
import { useStudents } from '@/hooks/useStudents';
import { formatDate } from '@/services/utils';
import { APP_CONFIG, STAGES } from '@/lib/constants';
import { Student } from '@/types';
import { CreditCard, Printer, Search, Download } from 'lucide-react';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

// ── Single ID Card Component ───────────────────────────────
function IDCard({ student }: { student: Student }) {
  return (
    <div
      className="id-card relative bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl overflow-hidden shadow-xl"
      style={{ width: 320, height: 200, flexShrink: 0 }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-amber-500/10" />

      {/* Gold top bar */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 w-full" />

      <div className="p-4 flex gap-3 h-full">
        {/* Left: Photo + QR */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/50 shadow-md">
            <StudentPhoto photoUrl={student.photo_url} name={student.name} size="lg" />
          </div>
          {student.qr_code ? (
            <div className="bg-white p-1 rounded-lg shadow">
              <QRCode value={student.qr_code} size={52} />
            </div>
          ) : (
            <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white/40 text-xs">لا QR</span>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          {/* Church name */}
          <div>
            <p className="text-amber-400 text-xs font-bold leading-tight">
              {APP_CONFIG.NAME}
            </p>
            <p className="text-blue-200 text-xs opacity-75">{APP_CONFIG.SUBTITLE}</p>
          </div>

          {/* Student info */}
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-tight truncate">{student.name}</h3>
            <p className="text-blue-200 text-xs truncate">{student.stage}</p>
            {student.birthday && (
              <p className="text-blue-300 text-xs">م: {formatDate(student.birthday)}</p>
            )}
            {student.confessor && (
              <p className="text-blue-300 text-xs truncate">أ: {student.confessor}</p>
            )}
          </div>

          {/* Code */}
          <div className="bg-white/10 rounded-lg px-2 py-1">
            <p className="text-xs font-mono text-amber-300 tracking-wider">
              {student.student_code}
            </p>
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function IDCardsPage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    students, loading, result, pagination, changePage,
  } = useStudents({ status: '1', search: searchQuery, stage: selectedStage || undefined });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search.trim());
  }

  function printSingle(student: Student) {
    setSelectedStudent(student);
    setTimeout(() => {
      window.print();
      setSelectedStudent(null);
    }, 300);
  }

  function printAll() {
    if (students.length === 0) {
      toast.error('لا توجد بطاقات للطباعة');
      return;
    }
    window.print();
    toast.success(`تمت طباعة ${students.length} بطاقة`);
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in no-print">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <CreditCard className="text-blue-700" size={24} />
            بطاقات الهوية
            {result && (
              <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {result.count}
              </span>
            )}
          </h1>
          <button onClick={printAll} className="btn-primary">
            <Printer size={16} />
            طباعة الكل
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5">
          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
              <input
                type="text"
                className="input flex-1 text-sm py-2"
                placeholder="بحث بالاسم..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-primary py-2 px-4">
                <Search size={16} />
              </button>
            </form>
            <select
              className="select text-sm py-2 w-48"
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
            >
              <option value="">كل الصفوف</option>
              {STAGES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-52 rounded-2xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="card p-12 text-center">
            <CreditCard size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">لا توجد بطاقات</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {students.map(student => (
                <div key={student.student_code} className="group relative">
                  <IDCard student={student} />
                  {/* Print button overlay */}
                  <button
                    onClick={() => printSingle(student)}
                    className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity
                               p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white"
                    title="طباعة هذه البطاقة"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              ))}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={result?.totalPages || 1}
              onPageChange={changePage}
              totalItems={result?.count}
              pageSize={pagination.pageSize}
            />
          </>
        )}
      </div>

      {/* ── Print Layout ── (visible only when printing) ───── */}
      <div className="print-only hidden">
        <style>{`
          @media print {
            @page { margin: 10mm; size: A4; }
            .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
            .id-card { break-inside: avoid; }
          }
        `}</style>
        <div className="print-grid">
          {(selectedStudent ? [selectedStudent] : students).map(s => (
            <IDCard key={s.student_code} student={s} />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
