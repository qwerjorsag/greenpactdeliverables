import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, LogOut, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../ui';

type Props = {
  username: string;
  counts: {
    electricity: number;
    water: number;
    waste: number;
    electricitySelfAudits: number;
    waterSelfAudits: number;
    wasteSelfAudits: number;
  };
  submissionStats: {
    last24Hours: number;
    last7Days: number;
    last28Days: number;
  };
  selfAuditStats: {
    last24Hours: number;
    last7Days: number;
    last28Days: number;
  };
  onLogout: () => void;
  onDownloadDatabase: () => void;
  isExporting: boolean;
  exportError: string;
};

const countKeys = [
  'electricity',
  'water',
  'waste',
] as const;

const selfAuditKeys = [
  'electricitySelfAudits',
  'waterSelfAudits',
  'wasteSelfAudits',
] as const;

const timeStatKeys = [
  'last24Hours',
  'last7Days',
  'last28Days',
] as const;

export default function DataOverview({
  username,
  counts,
  submissionStats,
  selfAuditStats,
  onLogout,
  onDownloadDatabase,
  isExporting,
  exportError,
}: Props) {
  const { t } = useTranslation('data');
  const safeCounts = {
    electricity: counts?.electricity ?? 0,
    water: counts?.water ?? 0,
    waste: counts?.waste ?? 0,
    electricitySelfAudits: counts?.electricitySelfAudits ?? 0,
    waterSelfAudits: counts?.waterSelfAudits ?? 0,
    wasteSelfAudits: counts?.wasteSelfAudits ?? 0,
  };
  const safeSubmissionStats = {
    last24Hours: submissionStats?.last24Hours ?? 0,
    last7Days: submissionStats?.last7Days ?? 0,
    last28Days: submissionStats?.last28Days ?? 0,
  };
  const safeSelfAuditStats = {
    last24Hours: selfAuditStats?.last24Hours ?? 0,
    last7Days: selfAuditStats?.last7Days ?? 0,
    last28Days: selfAuditStats?.last28Days ?? 0,
  };

  return (
    <div className="w-full max-w-6xl px-4 py-12 md:px-6">
      <div className="rounded-[2rem] bg-emerald-900 px-8 py-10 text-white shadow-[0_24px_70px_rgba(6,78,59,0.24)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.35em]">
                {t('overview.eyebrow')}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              {t('overview.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-emerald-100/85">
              {t('overview.loggedInAs')} <span className="font-bold">{username}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:self-auto">
            <PrimaryButton
              onClick={onDownloadDatabase}
              className="self-start md:self-auto"
              themeColor="emerald"
              disabled={isExporting}
            >
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                {isExporting ? t('overview.downloadingDatabase') : t('overview.downloadDatabase')}
              </span>
            </PrimaryButton>
            <PrimaryButton onClick={onLogout} className="self-start md:self-auto" themeColor="emerald">
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('overview.logout')}
              </span>
            </PrimaryButton>
          </div>
        </div>
        {exportError ? (
          <p className="mt-5 rounded-2xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-100">
            {exportError}
          </p>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {countKeys.map((key) => (
          <div
            key={key}
            className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-white p-5 text-center shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              {t(`overview.counts.${key}`)}
            </p>
            <p className="mt-4 text-3xl font-black text-stone-900">
              {safeCounts[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {timeStatKeys.map((key) => (
          <div
            key={`submission-${key}`}
            className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-white p-5 text-center shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              {t(`overview.submissionStats.${key}`)}
            </p>
            <p className="mt-4 text-3xl font-black text-stone-900">
              {safeSubmissionStats[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="my-8 flex items-center gap-4 text-emerald-700/70">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <span className="text-[0.65rem] font-black uppercase tracking-[0.35em]">

        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {selfAuditKeys.map((key) => (
          <div
            key={key}
            className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-white p-5 text-center shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              {t(`overview.counts.${key}`)}
            </p>
            <p className="mt-4 text-3xl font-black text-stone-900">
              {safeCounts[key]}
            </p>
          </div>
        ))}
      </div>



      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {timeStatKeys.map((key) => (
          <div
            key={`self-audit-${key}`}
            className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-white p-5 text-center shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              {t(`overview.selfAuditStats.${key}`)}
            </p>
            <p className="mt-4 text-3xl font-black text-stone-900">
              {safeSelfAuditStats[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
