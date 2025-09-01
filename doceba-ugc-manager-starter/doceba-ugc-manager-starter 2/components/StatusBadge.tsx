// components/StatusBadge.tsx
'use client';

import type { UploadStatus } from '@/types/admin';

const MAP: Record<UploadStatus, { label: string; cls: string }> = {
  approved:      { label: 'Genehmigt',        cls: 'bg-emerald-100 text-emerald-700' },
  submitted:     { label: 'Eingereicht',      cls: 'bg-blue-100 text-blue-700' },
  needs_changes: { label: 'Änderungen nötig', cls: 'bg-amber-100 text-amber-800' },
  rejected:      { label: 'Abgelehnt',        cls: 'bg-rose-100 text-rose-700' },
  partial:       { label: 'Teilweise',        cls: 'bg-sky-100 text-sky-700' },
  missing:       { label: 'Fehlt',            cls: 'bg-gray-200 text-gray-700' },
};

export function StatusBadge({ status }: { status: UploadStatus }) {
  const s = MAP[status] ?? MAP.missing;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${s.cls}`}>
      {s.label}
    </span>
  );
}
