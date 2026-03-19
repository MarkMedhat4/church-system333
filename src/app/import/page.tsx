// ============================================================
// /import — Import Data via SQL / Excel
// ============================================================

'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { STAGES } from '@/lib/constants';
import { generateStudentCode } from '@/services/utils';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface ImportRow {
  name: string;
  phone: string;
  parent_phone: string;
  stage: string;
  birthday?: string;
  confessor?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ── SQL Import Tab ─────────────────────────────────────────
function SQLImport() {
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Template SQL
  const templateSQL = `-- أمثلة على إدخال بيانات مباشرة
INSERT INTO students (student_code, name, phone, parent_phone, stage, birthday, confessor, status, active)
VALUES
  ('${generateStudentCode()}', 'يوسف مارك أنطون', '01012345678', '01098765432', 'الصف الأول الإعدادي', '2012-05-15', 'لوناسيرق', '1', true),
  ('${generateStudentCode()}', 'مريم بطرس عياد', '01112345678', '01212345678', 'الصف الثاني الثانوي', '2009-03-20', 'لوناسيرق', '1', true);
`;

  async function runSQL() {
    if (!sql.trim()) {
      toast.error('يرجى إدخال SQL أولاً');
      return;
    }

    // Basic safety check
    const dangerous = ['DROP', 'TRUNCATE', 'DELETE', 'ALTER', 'CREATE', 'GRANT'];
    const upper = sql.toUpperCase();
    if (dangerous.some(d => upper.includes(d))) {
      toast.error('لا يُسمح بأوامر الحذف أو التعديل الهيكلي');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { error } = await supabase.rpc('execute_safe_insert', { sql_query: sql });
      if (error) {
        setResult({ success: false, message: error.message });
        toast.error('فشل تنفيذ SQL');
      } else {
        setResult({ success: true, message: 'تم تنفيذ SQL بنجاح ✅' });
        toast.success('تم التنفيذ بنجاح');
        setSql('');
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-2">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">تعليمات SQL Import</p>
            <ul className="space-y-1 text-xs list-disc list-inside opacity-80">
              <li>يُسمح بأوامر INSERT فقط</li>
              <li>تأكد من إدخال student_code فريد لكل طالب</li>
              <li>status: '1' = مقبول، '0' = معلق</li>
              <li>active: true/false</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Template Button */}
      <button
        onClick={() => setSql(templateSQL)}
        className="btn-outline text-sm"
      >
        <FileText size={14} />
        استخدام قالب جاهز
      </button>

      {/* SQL Editor */}
      <div>
        <label className="label">أدخل SQL</label>
        <textarea
          className="input font-mono text-xs h-52 resize-none leading-relaxed"
          placeholder="INSERT INTO students ..."
          value={sql}
          onChange={e => setSql(e.target.value)}
          dir="ltr"
          spellCheck={false}
        />
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          result.success
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700'
        }`}>
          {result.success
            ? <CheckCircle size={16} className="flex-shrink-0" />
            : <XCircle size={16} className="flex-shrink-0" />
          }
          {result.message}
        </div>
      )}

      <button
        onClick={runSQL}
        disabled={loading || !sql.trim()}
        className="btn-primary w-full"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        تنفيذ SQL
      </button>
    </div>
  );
}

// ── Excel Import Tab ───────────────────────────────────────
function ExcelImport() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const REQUIRED_COLS = ['name', 'phone', 'parent_phone', 'stage'];

  const STAGE_MAP: Record<string, string> = {
    'prep1': 'الصف الأول الإعدادي',
    'prep2': 'الصف الثاني الإعدادي',
    'prep3': 'الصف الثالث الإعدادي',
    'sec1':  'الصف الأول الثانوي',
    'sec2':  'الصف الثاني الثانوي',
    'sec3':  'الصف الثالث الثانوي',
  };

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<any>(sheet);

      const parsed: ImportRow[] = jsonRows.map((row: any) => ({
        name:         row.name        || row.الاسم        || '',
        phone:        row.phone       || row.الهاتف       || '',
        parent_phone: row.parent_phone|| row['هاتف ولي الأمر'] || '',
        stage:        row.stage       || row.الصف         || '',
        birthday:     row.birthday    || row['تاريخ الميلاد'] || '',
        confessor:    row.confessor   || row['الأب الاعترافي'] || '',
      }));

      setRows(parsed.filter(r => r.name && r.phone));
      setResult(null);
    };
    reader.readAsArrayBuffer(file);
  }

  async function importRows() {
    if (!rows.length) return;
    setImporting(true);

    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        // Map stage if short form
        const stage = STAGE_MAP[row.stage.toLowerCase()] || row.stage;
        const validStage = STAGES.find(s => s.value === stage);

        if (!validStage) {
          errors.push(`"${row.name}" — صف غير صحيح: ${row.stage}`);
          failed++;
          continue;
        }

        const student_code = generateStudentCode();
        const { error } = await supabase.from('students').insert({
          student_code,
          name: row.name.trim(),
          phone: row.phone.toString().trim(),
          parent_phone: row.parent_phone.toString().trim(),
          stage: validStage.value,
          birthday: row.birthday || null,
          confessor: row.confessor || null,
          status: '1',
          active: true,
          points: 0,
        });

        if (error) {
          if (error.code === '23505') {
            errors.push(`"${row.name}" — الهاتف مسجل مسبقاً`);
          } else {
            errors.push(`"${row.name}" — ${error.message}`);
          }
          failed++;
        } else {
          success++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 50));
      } catch {
        failed++;
      }
    }

    setResult({ success, failed, errors });
    setImporting(false);
    if (success > 0) toast.success(`تم استيراد ${success} طالب ✅`);
    if (failed > 0) toast.error(`فشل ${failed} سجل`);
  }

  // Download template
  function downloadTemplate() {
    const template = [
      {
        name: 'يوسف مارك أنطون',
        phone: '01012345678',
        parent_phone: '01098765432',
        stage: 'الصف الأول الإعدادي',
        birthday: '2012-05-15',
        confessor: 'لوناسيرق',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students-template.xlsx');
    toast.success('تم تحميل القالب');
  }

  return (
    <div className="space-y-4">
      {/* Template Download */}
      <div className="flex items-center gap-3">
        <button onClick={downloadTemplate} className="btn-outline text-sm">
          <FileText size={14} />
          تحميل قالب Excel
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          استخدم القالب لتجنب أخطاء التنسيق
        </span>
      </div>

      {/* File Upload */}
      <div>
        <label className="label">اختر ملف Excel</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors">
          <Upload size={28} className="text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">انقر لرفع ملف Excel</span>
          <span className="text-xs text-slate-400 mt-1">.xlsx, .xls, .csv</span>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              معاينة: {rows.length} سجل
            </p>
            <button
              onClick={() => setRows([])}
              className="text-xs text-red-500 hover:underline"
            >
              مسح
            </button>
          </div>
          <div className="table-wrapper max-h-48">
            <table className="table text-xs">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>الصف</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td className="font-mono">{r.phone}</td>
                    <td>{r.stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-xs text-slate-400 mt-1 text-center">
              و {rows.length - 10} سجل آخر...
            </p>
          )}

          <button
            onClick={importRows}
            disabled={importing}
            className="btn-success w-full mt-3"
          >
            {importing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الاستيراد...
              </>
            ) : (
              <>
                <Upload size={16} />
                استيراد {rows.length} طالب
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl flex-1 text-center">
              <p className="text-2xl font-bold text-emerald-600">{result.success}</p>
              <p className="text-xs text-emerald-600">تم بنجاح</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl flex-1 text-center">
              <p className="text-2xl font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-red-500">فشل</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 py-0.5">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ImportPage() {
  const [tab, setTab] = useState<'excel' | 'sql'>('excel');

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Upload className="text-blue-700" size={24} />
            استيراد البيانات
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('excel')}
            className={tab === 'excel' ? 'btn-primary' : 'btn-outline'}
          >
            <FileText size={15} />
            Excel / CSV
          </button>
          <button
            onClick={() => setTab('sql')}
            className={tab === 'sql' ? 'btn-primary' : 'btn-outline'}
          >
            <FileText size={15} />
            SQL مباشر
          </button>
        </div>

        <div className="card p-6">
          {tab === 'excel' ? <ExcelImport /> : <SQLImport />}
        </div>

        {/* Warning */}
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
          <p>
            تأكد من مراجعة البيانات قبل الاستيراد. البيانات المستوردة بـ status='1' وactive=true تُعتبر مقبولة مباشرة.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
