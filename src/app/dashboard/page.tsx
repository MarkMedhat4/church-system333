// ============================================================
// /dashboard — Admin Dashboard
// ============================================================

'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import StudentPhoto from '@/components/ui/StudentPhoto';
import { SkeletonChart } from '@/components/skeletons';
import { useDashboard } from '@/hooks/usePoints';
import { formatDate, getDaysUntilBirthday } from '@/services/utils';
import {
  Users, UserCheck, Clock, QrCode, Star,
  UserX, Calendar, Trophy, Cake,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const {
    stats, todayCount, leaderboard,
    upcomingBirthdays, monthBirthdays,
    monthlyChart, loading,
  } = useDashboard();

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Stats Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="إجمالي الطلاب"  value={stats?.total || 0}    icon={Users}     color="blue"    loading={loading} />
          <StatCard label="مفعّلون"         value={stats?.approved || 0} icon={UserCheck}  color="emerald" loading={loading} />
          <StatCard label="حضور اليوم"      value={todayCount}            icon={QrCode}     color="sky"     loading={loading} />
          <StatCard label="طلبات معلقة"     value={stats?.pending || 0}  icon={Clock}      color="amber"   loading={loading} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          <StatCard label="مرفوضون"         value={stats?.rejected || 0} icon={UserX}      color="red"     loading={loading} />
          <StatCard label="غير نشطين"       value={stats?.inactive || 0} icon={Users}      color="purple"  loading={loading} />
        </div>

        {/* ── Main Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Monthly Attendance Chart */}
          <div className="lg:col-span-2 card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart size={18} className="text-blue-700" />
              الحضور الشهري
            </h3>
            {loading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyChart} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} />
                  <Tooltip
                    contentStyle={{
                      fontFamily: 'Cairo', fontSize: 12,
                      borderRadius: 10, border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                    formatter={(v: number) => [v, 'عدد الحضور']}
                  />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 3 Leaderboard */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              المتصدرون
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="skeleton w-7 h-7 rounded-full" />
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-2 w-1/2 rounded" />
                    </div>
                    <div className="skeleton h-6 w-10 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((student, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={student.student_code}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-xl w-7 text-center">
                        {medals[idx] || `${idx + 1}`}
                      </span>
                      <StudentPhoto photoUrl={student.photo_url} name={student.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {student.stage}
                        </p>
                      </div>
                      <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg">
                        {student.points} ★
                      </span>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Birthdays (next 7 days) */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Cake size={18} className="text-pink-500" />
              أعياد ميلاد قريبة (7 أيام)
            </h3>
            {loading ? <div className="skeleton h-24 rounded-xl" /> : (
              upcomingBirthdays.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                  لا توجد أعياد ميلاد في الأسبوع القادم
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingBirthdays.slice(0, 5).map(s => {
                    const days = getDaysUntilBirthday(s.birthday!);
                    return (
                      <div key={s.student_code} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <StudentPhoto photoUrl={s.photo_url} name={s.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(s.birthday!)}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          days === 0
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                        }`}>
                          {days === 0 ? '🎂 اليوم!' : `${days} يوم`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Month Birthdays Table */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              أعياد ميلاد الشهر
            </h3>
            {loading ? <div className="skeleton h-24 rounded-xl" /> : (
              monthBirthdays.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                  لا توجد أعياد ميلاد هذا الشهر
                </p>
              ) : (
                <div className="overflow-y-auto max-h-56">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>الصف</th>
                        <th>التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthBirthdays.map(s => (
                        <tr key={s.student_code}>
                          <td>
                            <div className="flex items-center gap-2">
                              <StudentPhoto photoUrl={s.photo_url} name={s.name} size="sm" />
                              <span className="font-medium">{s.name}</span>
                            </div>
                          </td>
                          <td className="text-slate-500">{s.stage}</td>
                          <td>{formatDate(s.birthday!)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
