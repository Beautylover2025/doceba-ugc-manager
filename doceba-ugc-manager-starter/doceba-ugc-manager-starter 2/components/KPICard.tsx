// components/KPICard.tsx
'use client';

import type { KPI } from '@/types/admin';

const COLOR: Record<NonNullable<KPI['variant']>, string> = {
  primary: 'border-blue-200',
  success: 'border-emerald-200',
  warning: 'border-amber-200',
  danger:  'border-rose-200',
};

export function KPICard({ title, value, icon: Icon, variant = 'primary' }: KPI) {
  const border = COLOR[variant] ?? COLOR.primary;
  return (
    <div className={`rounded-2xl border bg-white p-4 ${border}`}>
      <div className="flex items-center gap-3">
        {Icon ? <Icon className="h-5 w-5 text-gray-500" /> : null}
        <div className="text-sm text-gray-600">{title}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
