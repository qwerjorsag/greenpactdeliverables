import React from 'react';
import clsx from 'clsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  title: string;
  description: string;
  downloadLabel: string;
  closeLabel: string;
  className?: string;
};

export default function PdfDownloadModal({
  open,
  onClose,
  onDownload,
  title,
  description,
  downloadLabel,
  closeLabel,
  className,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 cursor-pointer" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-stone-900 cursor-pointer transition"
          >
            {closeLabel}
          </button>
        </div>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition cursor-pointer hover:scale-[1.05]"
          >
            {closeLabel}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition cursor-pointer hover:scale-[1.05]"
          >
            {downloadLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
