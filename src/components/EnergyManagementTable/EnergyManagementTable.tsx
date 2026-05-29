import React from 'react';
import { useTranslation } from 'react-i18next';
import { energyBenchmarks, MetricKey } from '../../data/energyBenchmarks';

interface EnergyManagementTableProps {
  totalEnergyKwh: number | null;
  totalEmissionsKg: number | null;
  floorAreaM2: number | null;
  roomNights: number | null;
  profileId: string;
  periodTitle?: string | null;
}

type Range = { min: number; max: number | null; label: string };

type StatusKey = 'within' | 'slightly' | 'high' | 'lowEmissions' | 'aboveAverage' | 'unknown';

const formatValue = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '-';
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const evaluateStatus = (value: number | null, range: Range, key: MetricKey): StatusKey => {
  if (value === null || Number.isNaN(value)) return 'unknown';

  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;

  if (key === 'emissionsPerRoomNight') {
    if (value <= upperTypical) return 'lowEmissions';
    if (value <= limit) return 'aboveAverage';
    return 'high';
  }

  if (value <= upperTypical) return 'within';
  if (value <= limit) return 'slightly';

  return 'high';
};

const getStatusClass = (status: StatusKey) => {
  switch (status) {
    case 'within':
    case 'lowEmissions':
      return 'text-emerald-700';
    case 'slightly':
    case 'aboveAverage':
      return 'text-amber-700';
    case 'high':
      return 'text-red-700';
    default:
      return 'text-stone-500';
  }
};

const getRecommendation = (key: MetricKey, range: Range, value: number | null, t: (key: string) => string) => {
  if (value === null || Number.isNaN(value)) return '-';

  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;
  const baseKey = `energyManagement.recommendations.${key}`;

  if (value <= upperTypical) return t(`${baseKey}.within`);
  if (value <= limit) return t(`${baseKey}.slightly`);
  return t(`${baseKey}.high`);
};

export default function EnergyManagementTable({
  totalEnergyKwh,
  totalEmissionsKg,
  floorAreaM2,
  roomNights,
  profileId,
  periodTitle,
}: EnergyManagementTableProps) {
  const { t } = useTranslation('electricity');
  const energyPerM2 =
    totalEnergyKwh !== null && floorAreaM2 ? totalEnergyKwh / floorAreaM2 : null;
  const energyPerRoomNight =
    totalEnergyKwh !== null && roomNights ? totalEnergyKwh / roomNights : null;
  const emissionsPerM2 =
    totalEmissionsKg !== null && floorAreaM2 ? totalEmissionsKg / floorAreaM2 : null;
  const emissionsPerRoomNight =
    totalEmissionsKg !== null && roomNights ? totalEmissionsKg / roomNights : null;

  const values: Record<MetricKey, number | null> = {
    energyPerM2,
    energyPerRoomNight,
    emissionsPerM2,
    emissionsPerRoomNight,
  };

  const categoryIndex = Math.max(
    0,
    Math.min(energyBenchmarks.categories.length - 1, Number.parseInt(profileId, 10) - 1 || 0)
  );

  return (
    <div className="space-y-4">
      {periodTitle ? (
        <div className="flex justify-between items-center">
          <h3>{periodTitle}</h3>
        </div>
      ) : null}

      <div className="gp-table-wrap">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="px-1 md:px-4 py-3 rounded-tl-2xl w-10 md:w-auto">
                {t('energyManagement.headers.metric')}
              </th>
              <th className="px-4 py-3 hidden md:table-cell">{t('energyManagement.headers.expected')}</th>
              <th className="px-1 md:px-4 py-3">{t('energyManagement.headers.results')}</th>
              <th className="px-1 md:px-4 py-3 rounded-tr-2xl">{t('energyManagement.headers.recommendation')}</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {energyBenchmarks.metrics.map((metric) => {
              const range = metric.ranges[categoryIndex] as Range | undefined;
              const value = values[metric.key];
              const statusKey = range ? evaluateStatus(value, range, metric.key) : 'unknown';
              const statusText =
                statusKey === 'within'
                  ? t('energyManagement.status.within')
                  : statusKey === 'slightly'
                    ? t('energyManagement.status.slightly')
                    : statusKey === 'lowEmissions'
                      ? t('energyManagement.status.lowEmissions')
                      : statusKey === 'aboveAverage'
                        ? t('energyManagement.status.aboveAverage')
                        : statusKey === 'high'
                          ? t(`energyManagement.status.high_${metric.key}`, t('energyManagement.status.high_generic'))
                          : '-';
              const statusClass = getStatusClass(statusKey);
              const rowClass = statusKey === 'lowEmissions' || statusKey === 'within'
                ? 'bg-emerald-50/60'
                : statusKey === 'slightly' || statusKey === 'aboveAverage'
                  ? 'bg-amber-50/60'
                  : statusKey === 'high'
                    ? 'bg-red-50/60'
                    : '';
              const rowTextClass = statusKey === 'lowEmissions' || statusKey === 'within'
                ? 'text-emerald-800'
                : statusKey === 'slightly' || statusKey === 'aboveAverage'
                  ? 'text-amber-800'
                  : statusKey === 'high'
                    ? 'text-red-800'
                    : 'text-stone-800';
              const recommendation = range ? getRecommendation(metric.key, range, value, t) : '-';

              return (
                <tr key={metric.key} className={`border-b border-stone-100 last:border-0 ${rowClass}`}>
                  <td className="px-1 md:px-4 py-3 w-10 md:w-auto">
                    <div className={`font-semibold ${rowTextClass}`}>
                      {t(`energyManagement.metrics.${metric.key}`)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${rowTextClass} hidden md:table-cell`}>{range ? range.label : '-'}</td>
                  <td className="px-1 md:px-4 py-3">
                    <div className={`font-semibold ${rowTextClass}`}>{formatValue(value)}</div>
                    <div className={`text-xs font-semibold ${statusClass}`}>{statusText}</div>
                  </td>
                  <td className={`px-1 md:px-4 py-3 ${rowTextClass}`}>{recommendation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


