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
  themeColor?: 'yellow' | 'blue' | 'stone';
};

export default function SelfAuditDownloadWindow({
  open,
  onClose,
  onDownload,
  title,
  description,
  downloadLabel,
  closeLabel,
  themeColor = 'yellow',
}: Props) {
  if (!open) return null;

  const theme = {
    yellow: { bg: 'bg-yellow-400', text: 'text-black', ring: 'ring-yellow-300' },
    blue: { bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-300' },
    stone: { bg: 'bg-stone-800', text: 'text-white', ring: 'ring-stone-400' },
  }[themeColor];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 cursor-pointer"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
            <p className="mt-2 text-sm text-stone-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-all hover:scale-110 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-all hover:scale-105 cursor-pointer"
          >
            {closeLabel}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest shadow-md transition-all hover:scale-105 focus:outline-none focus:ring-2 cursor-pointer',
              theme.bg,
              theme.text,
              theme.ring
            )}
          >
            {downloadLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
