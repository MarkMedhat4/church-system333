// ============================================================
// /scanner — QR Code Scanner with Anti-Cheat
// ============================================================

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentPhoto from '@/components/ui/StudentPhoto';
import { useQRScanner } from '@/hooks/useAttendance';
import { useTodayAttendance } from '@/hooks/useAttendance';
import { isScanWindowOpen, formatTime } from '@/services/utils';
import { cn } from '@/services/utils';
import {
  QrCode, Camera, CameraOff, CheckCircle,
  XCircle, Clock, Users, AlertTriangle,
} from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const { lastResult, processing, history, handleScan, scanning, setScanning } = useQRScanner();
  const { records: todayRecords, count: todayCount } = useTodayAttendance();
  const [windowStatus, setWindowStatus] = useState(isScanWindowOpen());
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  // Check window every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setWindowStatus(isScanWindowOpen());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize QR scanner
  const startScanner = useCallback(() => {
    if (!scannerDivRef.current || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [0], // camera only
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await handleScan(decodedText);
      },
      (error) => {
        // Ignore scan errors (no QR in frame)
      }
    );

    scannerRef.current = scanner;
    setScanning(true);
  }, [handleScan, setScanning]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }, [setScanning]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const isWindowOpen = windowStatus.allowed;

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <QrCode className="text-blue-700" size={24} />
            مسح QR
          </h1>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
              isWindowOpen
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                isWindowOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              )} />
              {isWindowOpen ? 'وقت المسح مفتوح' : windowStatus.reason}
            </div>
          </div>
        </div>

        {/* Sunday / Time Warning */}
        {!isWindowOpen && (
          <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  المسح غير متاح الآن
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  {windowStatus.reason || 'المسح متاح يوم الأحد من 6 مساءً حتى 9 مساءً'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Camera / Scanner ─────────────────────────────── */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera size={18} className="text-blue-700" />
              الكاميرا
            </h3>

            {/* Scanner Container */}
            <div className={cn(
              'relative rounded-2xl overflow-hidden bg-slate-900',
              scanning && 'scanner-active'
            )}>
              <div ref={scannerDivRef} id="qr-reader" className="w-full" />

              {/* Overlay when not scanning */}
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 min-h-[200px]">
                  <QrCode size={48} className="text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">الكاميرا متوقفة</p>
                </div>
              )}
            </div>

            {/* Processing indicator */}
            {processing && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                جاري التحقق...
              </div>
            )}

            {/* Last Scan Result */}
            {lastResult && (
              <div className={cn(
                'mt-3 p-3 rounded-xl flex items-center gap-3 text-sm font-medium',
                lastResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              )}>
                {lastResult.success
                  ? <CheckCircle size={18} className="flex-shrink-0" />
                  : <XCircle size={18} className="flex-shrink-0" />
                }
                <span>{lastResult.message}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {!scanning ? (
                <button
                  onClick={startScanner}
                  disabled={!isWindowOpen}
                  className="btn-primary flex-1"
                >
                  <Camera size={16} />
                  تشغيل الكاميرا
                </button>
              ) : (
                <button onClick={stopScanner} className="btn-danger flex-1">
                  <CameraOff size={16} />
                  إيقاف
                </button>
              )}
            </div>
          </div>

          {/* ── Today Stats + History ─────────────────────────── */}
          <div className="space-y-4">
            {/* Today Count */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">حضور اليوم</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-400">{todayCount}</p>
              </div>
            </div>

            {/* Scan History (this session) */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Clock size={16} className="text-slate-400" />
                آخر المسحات
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد مسحات بعد</p>
                ) : (
                  history.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg text-xs',
                        item.success
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      )}
                    >
                      {item.success
                        ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        : <XCircle    size={14} className="text-red-500 flex-shrink-0" />
                      }
                      <span className={cn(
                        'flex-1 truncate',
                        item.success
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}>
                        {item.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today Attendance List */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                سجل الحضور اليوم
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {todayRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">لا يوجد حضور بعد</p>
                ) : (
                  todayRecords.slice(0, 15).map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {record.student_name}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono">
                        {formatTime(record.time)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
