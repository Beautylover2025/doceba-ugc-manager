// types/admin.ts
export type UploadStatus =
  | 'approved'
  | 'submitted'
  | 'needs_changes'
  | 'rejected'
  | 'partial'
  | 'missing';

export type ImageSlot = {
  thumbUrl?: string | null;
  downloadHref?: string | null;
};

export type UploadRow = {
  id: string;
  creatorId: string;
  programId: string;
  week: number;
  status: UploadStatus;
  createdAt: string; // ISO
  before: ImageSlot;
  after: ImageSlot;
};

export type KPI = {
  title: string;
  value: number | string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: (props: { className?: string }) => JSX.Element;
};
