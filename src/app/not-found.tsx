// ============================================================
// not-found.tsx — 404 Page
// ============================================================

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-white/10 mb-4 leading-none">404</div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Search size={30} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة</h1>
        <p className="text-blue-300 text-sm mb-8">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
        >
          <Home size={18} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
