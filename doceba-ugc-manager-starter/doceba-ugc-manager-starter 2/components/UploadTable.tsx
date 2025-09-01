// components/UploadTable.tsx
'use client';

import type { UploadRow } from '@/types/admin';
import { StatusBadge } from './StatusBadge';

export function UploadTable({ uploads }: { uploads: UploadRow[] }) {
  return (
    <div className="overflow-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="p-2 text-left">Creator-ID</th>
            <th className="p-2 text-left">Programm-ID</th>
            <th className="p-2">Woche</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Vorher-Bild</th>
            <th className="p-2 text-left">Nachher-Bild</th>
            <th className="p-2 text-left">Erstellt</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50/50">
              <td className="p-2">{u.creatorId}</td>
              <td className="p-2">{u.programId}</td>
              <td className="p-2 text-center">{u.week}</td>
              <td className="p-2"><StatusBadge status={u.status} /></td>
              <td className="p-2"><ThumbAndDownload thumb={u.before.thumbUrl} href={u.before.downloadHref} /></td>
              <td className="p-2"><ThumbAndDownload thumb={u.after.thumbUrl} href={u.after.downloadHref} /></td>
              <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThumbAndDownload({ thumb, href }: { thumb?: string | null; href?: string | null }) {
  const cleanHref = (href ?? '').trim();
  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-24 overflow-hidden rounded border bg-gray-100">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-gray-400">Kein Bild</div>
        )}
      </div>
      {cleanHref ? (
        <a
          href={cleanHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
          download
        >
          Download
        </a>
      ) : (
        <span className="text-xs text-gray-400">–</span>
      )}
    </div>
  );
}
