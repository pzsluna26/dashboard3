'use client';

export default function HotBadge() {
  return (
    <div className="px-2 py-1 bg-gradient-to-r from-[color-mix(in_oklab,var(--color-red-500)_100%,transparent)] to-[color-mix(in_oklab,var(--color-orange-500)_100%,transparent)] text-white text-xs font-bold rounded-md animate-pulse shadow-sm border border-white/20">
      HOT
    </div>
  );
}