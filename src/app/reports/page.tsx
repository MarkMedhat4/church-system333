// ============================================================
// /reports — Reports + Excel/PDF Export
// ============================================================

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { SkeletonTable } from '@/components/skeletons';
import { useAttendanceByMonth } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { downloadAsExcel } from '@/services/utils';
import { formatDate, formatDateTime, getCurrentMonthYear } from '@/services/utils';
import { BarChart3, Download, FileText, Table2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'attendance' | 'students'>('attendance');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());

  const { records, loading: attLoading, count } = useAttendanceByMonth(selectedMonth);
  const { students, loading: studLoading } = useStudents({ status: '1' });

  // ── Export Excel ────────────────────────────────────────
  function exportAttendanceExcel() {
    const data = records.map(r => ({
      'الطالب': r.student_name,
      'رقم الطالب': r.student_id,
      'التاريخ': r.date,
      'الوقت': r.time?.slice(0, 5),
      'الحالة': 'حاضر',
    }));
    downloadAsExcel(data, `حضور-${selectedMonth}`);
    toast.success('تم تصدير Excel ✅');
  }

  function exportStudentsExcel() {
    const data = students.map(s => ({
      'الكود': s.student_code,
      'الاسم': s.name,
      'الصف': s.stage,
      'الهاتف': s.phone,
      'هاتف ولي الأمر': s.parent_phone,
      'تاريخ الميلاد': s.birthday || '',
      'الأب الاعترافي': s.confessor || '',
      'النقاط': s.points,
      'تاريخ التسجيل': formatDateTime(s.created_at),
    }));
    downloadAsExcel(data, 'قائمة-الطلاب');
    toast.success('تم تصدير Excel ✅');
  }

  // ── Export PDF ──────────────────────────────────────────
  function exportAttendancePDF() {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Attendance Report — ${selectedMonth}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Total: ${count} records`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Student', 'Code', 'Date', 'Time']],
      body: records.map(r => [
        r.student_name, r.student_id, r.date, r.time?.slice(0, 5)
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`attendance-${selectedMonth}.pdf`);
    toast.success('تم تصدير PDF ✅');
  }

  function exportStudentsPDF() {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Students Report', 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [['Code', 'Name', 'Stage', 'Phone', 'Points', 'Status']],
      body: students.map(s => [
        s.student_code, s.name, s.stage, s.phone, s.points, 'Active'
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save('students-report.pdf');
    toast.success('تم تصدير PDF ✅');
  }

  const isLoading = reportType === 'attendance' ? attLoading : studLoading;

  return (
    <AdminLayout>
      <div className="animate-fade-in">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="text-blue-700" size={24} />
            التقارير
          </h1>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Report Type */}
            <div className="flex gap-2">
              <button
                onClick={() => setReportType('attendance')}
                className={reportType === 'attendance' ? 'btn-primary py-2' : 'btn-outline py-2'}
              >
                <Calendar size={15} />
                الحضور
              </button>
              <button
                onClick={() => setReportType('students')}
                className={reportType === 'students' ? 'btn-primary py-2' : 'btn-outline py-2'}
              >
                <Table2 size={15} />
                الطلاب
              </button>
            </div>

            {/* Month Picker (attendance only) */}
            {reportType === 'attendance' && (
              <input
                type="month"
                className="input py-2 w-44 text-sm"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                dir="ltr"
              />
            )}

            {/* Export Buttons */}
            <div className="flex gap-2 mr-auto">
              <button
                onClick={reportType === 'attendance' ? exportAttendanceExcel : exportStudentsExcel}
                className="btn-success py-2"
                disabled={isLoading}
              >
                <Download size={15} />
                Excel
              </button>
              <button
                onClick={reportType === 'attendance' ? exportAttendancePDF : exportStudentsPDF}
                className="btn-primary py-2"
                disabled={isLoading}
              >
                <FileText size={15} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {reportType === 'attendance' && (
          <div className="card p-4 mb-5 flex items-center gap-4">
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-400">{count}</div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">إجمالي الحضور</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                شهر {new Date(selectedMonth + '-01').toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={10} cols={5} />
        ) : reportType === 'attendance' ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الطالب</th>
                  <th>رقم الطالب</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">لا يوجد حضور في هذا الشهر</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-slate-400 text-xs">{i + 1}</td>
                      <td className="font-medium">{r.student_name}</td>
                      <td className="font-mono text-xs text-slate-500">{r.student_id}</td>
                      <td>{formatDate(r.date)}</td>
                      <td className="font-mono text-xs">{r.time?.slice(0, 5)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الاسم</th>
                  <th>الصف</th>
                  <th>الهاتف</th>
                  <th>النقاط</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.student_code}>
                    <td className="font-mono text-xs text-slate-500">{s.student_code}</td>
                    <td className="font-medium">{s.name}</td>
                    <td className="text-xs">{s.stage}</td>
                    <td className="font-mono text-xs">{s.phone}</td>
                    <td className="font-bold text-amber-600">{s.points}</td>
                    <td className="text-xs text-slate-500">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
