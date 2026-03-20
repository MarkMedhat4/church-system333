// ============================================================
// /scanner — QR Scanner | مارك مدحت فقط (super_admin)
// ============================================================

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQRScanner } from '@/hooks/useAttendance';
import { useTodayAttendance } from '@/hooks/useAttendance';
import { useAdminAuth } from '@/hooks/useAuth';
import { formatTime } from '@/services/utils';
import { cn } from '@/services/utils';
import {
  QrCode, Camera, CameraOff, CheckCircle,
  XCircle, Clock, Users, ShieldOff, FlipHorizontal,
} from 'lucide-react';

export default function ScannerPage() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  const { lastResult, processing, history, handleScan, scanning, setScanning } = useQRScanner(isSuperAdmin);
  const { records: todayRecords, count: todayCount } = useTodayAttendance();

  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number>(0);
  const lastQR     = useRef<string>('');
  const lastQRTime = useRef<number>(0);

  const [camError, setCamError]   = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // ── Scan loop ─────────────────────────────────────────────
  const scanLoop = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      let qrData: string | null = null;

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const codes    = await detector.detect(canvas);
        if (codes.length > 0) qrData = codes[0].rawValue;
      } else {
        const jsQR     = (await import('jsqr')).default;
        const imgData  = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code     = jsQR(imgData.data, imgData.width, imgData.height);
        if (code) qrData = code.data;
      }

      const now = Date.now();
      if (qrData && (qrData !== lastQR.current || now - lastQRTime.current > 9000)) {
        lastQR.current     = qrData;
        lastQRTime.current = now;
        await handleScan(qrData);
      }
    } catch { /* silent */ }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, [handleScan]);

  // ── Start camera ──────────────────────────────────────────
  const startCamera = useCallback(async (facing: 'environment' | 'user' = facingMode) => {
    setCamError(null);
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'لم يُسمح بالوصول للكاميرا — افتح إعدادات المتصفح وافعّل الكاميرا'
        : err?.name === 'NotFoundError'
        ? 'لا توجد كاميرا على هذا الجهاز'
        : 'تعذّر تشغيل الكاميرا: ' + err?.message;
      setCamError(msg);
    }
  }, [facingMode, scanLoop, setScanning]);

  // ── Stop camera ───────────────────────────────────────────
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, [setScanning]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  async function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (scanning) await startCamera(next);
  }

  // ══════════════════════════════════════════════════════════
  // BLOCKED — not super_admin
  // ══════════════════════════════════════════════════════════
  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-5">
            <ShieldOff size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            صلاحية غير كافية
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
            مسح QR مخصص لـ <span className="font-bold text-blue-700 dark:text-blue-400">مارك مدحت</span> فقط.
            تواصل معه لتسجيل الحضور.
          </p>
        </div>
      </AdminLayout>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCANNER — super_admin only
  // ══════════════════════════════════════════════════════════
  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <QrCode className="text-blue-700" size={24} />
            مسح QR
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            متاح في أي وقت
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Camera ─────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera size={18} className="text-blue-700" /> الكاميرا
            </h3>

            <div
              className={cn('relative rounded-2xl overflow-hidden bg-black', scanning && 'scanner-active')}
              style={{ aspectRatio: '4/3' }}
            >
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {/* Stopped overlay */}
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                  <QrCode size={56} className="text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">اضغط تشغيل لبدء المسح</p>
                </div>
              )}

              {/* Guide frame */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 relative">
                    <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                    <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  </div>
                </div>
              )}

              {/* Flip button */}
              {scanning && (
                <button
                  onClick={flipCamera}
                  className="absolute top-3 left-3 p-2 bg-black/50 text-white rounded-xl"
                >
                  <FlipHorizontal size={18} />
                </button>
              )}
            </div>

            {/* Camera error */}
            {camError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                {camError}
              </div>
            )}

            {/* Processing */}
            {processing && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                جاري التحقق...
              </div>
            )}

            {/* Last result */}
            {lastResult && (
              <div className={cn(
                'mt-3 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fade-in',
                lastResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700'
              )}>
                {lastResult.success
                  ? <CheckCircle size={18} className="flex-shrink-0" />
                  : <XCircle    size={18} className="flex-shrink-0" />
                }
                {lastResult.message}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {!scanning ? (
                <button onClick={() => startCamera()} className="btn-primary flex-1 py-3 text-base">
                  <Camera size={18} /> تشغيل الكاميرا
                </button>
              ) : (
                <button onClick={stopCamera} className="btn-danger flex-1 py-3 text-base">
                  <CameraOff size={18} /> إيقاف
                </button>
              )}
            </div>
          </div>

          {/* ── Stats + History ───────────────────────── */}
          <div className="space-y-4">

            {/* Today count */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">حضور اليوم</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-400">{todayCount}</p>
              </div>
            </div>

            {/* Session history */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Clock size={16} className="text-slate-400" /> آخر المسحات
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد مسحات بعد</p>
                ) : history.slice(0, 10).map((item, idx) => (
                  <div key={idx} className={cn(
                    'flex items-center gap-2 p-2 rounded-lg text-xs',
                    item.success ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                  )}>
                    {item.success
                      ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      : <XCircle    size={14} className="text-red-500 flex-shrink-0" />
                    }
                    <span className={cn(
                      'flex-1 truncate',
                      item.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {item.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today list */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                سجل الحضور اليوم
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {todayRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">لا يوجد حضور بعد</p>
                ) : todayRecords.slice(0, 20).map(record => (
                  <div key={record.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {record.student_name}
                    </span>
                    <span className="text-slate-400 font-mono">{formatTime(record.time)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
