// ============================================================
// Skeleton Components — Loading States
// ============================================================

'use client';

// ── Base Skeleton ─────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`} />
  );
}

// ── Skeleton Row (for tables) ─────────────────────────────
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-t border-slate-100 dark:border-slate-700">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Skeleton Card ─────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded w-1/2" />
          <div className="skeleton h-6 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Stat Cards (dashboard) ──────────────────────
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Skeleton Table ────────────────────────────────────────
export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton h-3 rounded w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Skeleton Student Card (registration cards) ────────────
export function SkeletonStudentCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded w-3/5" />
          <div className="skeleton h-3 rounded w-2/5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
        <div className="skeleton h-3 rounded w-4/5" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-9 rounded-xl flex-1" />
        <div className="skeleton h-9 rounded-xl flex-1" />
      </div>
    </div>
  );
}

// ── Skeleton Profile ──────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="card p-6 flex flex-col items-center gap-4">
        <div className="skeleton w-24 h-24 rounded-full" />
        <div className="skeleton h-5 rounded w-40" />
        <div className="skeleton h-4 rounded w-24" />
      </div>
      <div className="card p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="skeleton h-4 rounded w-24" />
            <div className="skeleton h-4 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton Chart ────────────────────────────────────────
export function SkeletonChart() {
  return (
    <div className="card p-5">
      <div className="skeleton h-5 rounded w-40 mb-6" />
      <div className="flex items-end gap-3 h-40">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <div
            key={i}
            className="skeleton flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton Leaderboard ──────────────────────────────────
export function SkeletonLeaderboard({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="skeleton w-7 h-7 rounded-full" />
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 rounded w-3/5" />
            <div className="skeleton h-3 rounded w-2/5" />
          </div>
          <div className="skeleton h-6 w-12 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
