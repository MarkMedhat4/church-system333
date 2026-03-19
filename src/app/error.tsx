'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">حدث خطأ</h1>
        <p className="text-slate-400 text-sm mb-2">
          حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
        </p>
        {error.message && (
          <p className="text-xs text-slate-600 bg-slate-800 rounded-lg p-2 mb-6 font-mono text-right">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            حاول مرة أخرى
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Home size={16} />
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
