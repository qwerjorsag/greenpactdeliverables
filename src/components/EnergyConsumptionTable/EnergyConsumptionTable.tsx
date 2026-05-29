// EnergyConsumptionTable: extend templateRows below to add new indicators.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NormalizationTarget = {
  id: 'perRoomNight' | 'perM2Year';
  divisorKey: 'roomNights' | 'floorAreaM2';
};

type IndicatorRow = {
  id: 'total-energy' | 'total-energy-alt';
  conversionFactorToGJ: number;
  normalizationTargets: NormalizationTarget[];
};

type DenominatorsByYear = Record<number, { roomNights: number | null; floorAreaM2: number | null }>;
type ValuesByRow = Record<string, Record<number, number | null>>;

const templateRows: IndicatorRow[] = [
  {
    id: 'total-energy',
    conversionFactorToGJ: 0.0036,
    normalizationTargets: [
      { id: 'perRoomNight', divisorKey: 'roomNights' },
      { id: 'perM2Year', divisorKey: 'floorAreaM2' },
    ],
  },
  {
    id: 'total-energy-alt',
    conversionFactorToGJ: 0.0036,
    normalizationTargets: [
      { id: 'perM2Year', divisorKey: 'floorAreaM2' },
      { id: 'perRoomNight', divisorKey: 'roomNights' },
    ],
  },
];

const defaultYears = [2027, 2028, 2029];

const formatNumber = (value: number | null, decimals = 2) => {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const percentChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const evaluateDisplay = (pct: number | null, t: (key: string) => string) => {
  if (pct === null || Number.isNaN(pct)) return { label: '—', color: 'neutral' as const };
  const abs = Math.abs(pct);
  if (abs >= 10) {
    return {
      label: pct > 0 ? t('energyConsumption.evaluationLabels.significantIncrease') : t('energyConsumption.evaluationLabels.significantDecrease'),
      color: pct > 0 ? 'red' : 'green',
    };
  }
  if (abs >= 5) return { label: t('energyConsumption.evaluationLabels.moderateChange'), color: 'orange' as const };
  return { label: t('energyConsumption.evaluationLabels.minorChange'), color: 'neutral' as const };
};

const reportCategory = (pct: number | null) => {
  if (pct === null || Number.isNaN(pct)) return 'none' as const;
  const abs = Math.abs(pct);
  if (abs >= 20) return 'key' as const;
  if (abs >= 10) return 'significant' as const;
  if (abs >= 5) return 'notable' as const;
  return 'normal' as const;
};

const reportText = (
  pct: number | null,
  category: 'normal' | 'notable' | 'significant' | 'key' | 'none',
  t: (key: string) => string
) => {
  if (pct === null || Number.isNaN(pct)) return '—';
  const isDecrease = pct < 0;
  if (category === 'normal') return t('energyConsumption.report.stable');
  if (category === 'notable') {
    return isDecrease ? t('energyConsumption.report.slightImprovement') : t('energyConsumption.report.slightIncrease');
  }
  if (category === 'significant') {
    return isDecrease ? t('energyConsumption.report.significantImprovement') : t('energyConsumption.report.significantIncrease');
  }
  if (category === 'key') {
    return isDecrease ? t('energyConsumption.report.majorImprovement') : t('energyConsumption.report.majorDeterioration');
  }
  return '—';
};

interface EnergyConsumptionTableProps {
  years?: number[];
  denominators?: DenominatorsByYear;
  values?: ValuesByRow;
}

export default function EnergyConsumptionTable({
  years: yearsProp,
  denominators: denominatorsProp,
  values: valuesProp,
}: EnergyConsumptionTableProps) {
  const { t } = useTranslation('electricity');

  const years = yearsProp && yearsProp.length ? yearsProp : defaultYears;
  const rows = templateRows;
  const denominators = denominatorsProp || Object.fromEntries(years.map((y) => [y, { roomNights: null, floorAreaM2: null }]));
  const values = valuesProp || Object.fromEntries(rows.map((r) => [r.id, Object.fromEntries(years.map((y) => [y, null]))]));

  const computed = useMemo(() => {
    return rows.map((row) => {
      const target = row.normalizationTargets[0];
      const byYear = years.map((year) => {
        const raw = values[row.id]?.[year] ?? null;
        const converted = raw === null ? null : raw * row.conversionFactorToGJ;
        const denom = denominators[year]?.[target.divisorKey] ?? null;
        const normalized = converted === null || denom === null || denom === 0 ? null : converted / denom;
        return { year, raw, converted, normalized };
      });
      return { row, byYear };
    });
  }, [rows, years, values, denominators]);

  const unitLabel = (unitId: NormalizationTarget['id']) => t(`energyConsumption.units.${unitId}`);

  const evalClass = (color: string) => {
    if (color === 'red') return 'bg-red-100 text-red-700';
    if (color === 'green') return 'bg-emerald-100 text-emerald-700';
    if (color === 'orange') return 'bg-amber-100 text-amber-700';
    return 'bg-stone-100 text-stone-600';
  };

  const rowTitle = (rowId: IndicatorRow['id']) =>
    rowId === 'total-energy' ? t('energyConsumption.totalEnergy') : t('energyConsumption.totalEnergyAlt');

  return (
    <div className="space-y-6">
      {computed.map(({ row, byYear }) => (
        <div key={row.id}>
          <h3 className="mb-3">{rowTitle(row.id)}</h3>
          <div className="gp-table-wrap">
            <table className="gp-table">
              <thead className="gp-table-head">
                <tr>
                  <th className="gp-th gp-th-left px-1 md:px-4">{t('energyConsumption.year')}</th>
                  {years.map((year, idx) => (
                    <th
                      key={year}
                      className={`gp-th gp-th-center px-1 md:px-4 ${idx === years.length - 1 ? 'gp-th-right' : ''}`}
                    >
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'raw', label: `${t('energyConsumption.raw')} (kWh)`, values: byYear.map((c) => formatNumber(c.raw, 0)) },
                  { key: 'converted', label: t('energyConsumption.converted'), values: byYear.map((c) => formatNumber(c.converted, 2)) },
                  {
                    key: 'normalized',
                    label: `${t('energyConsumption.normalized')} (${unitLabel(row.normalizationTargets[0].id)})`,
                    values: byYear.map((c) => formatNumber(c.normalized, 3)),
                  },
                  {
                    key: 'percent',
                    label: t('energyConsumption.percentChange'),
                    values: byYear.map((cell, idx) => {
                      const previous = idx > 0 ? byYear[idx - 1] : null;
                      const pct = percentChange(cell.raw, previous?.raw ?? null);
                      return pct === null ? '—' : `${formatNumber(pct, 1)}%`;
                    }),
                  },
                  {
                    key: 'evaluation',
                    label: t('energyConsumption.evaluation'),
                    values: byYear.map((cell, idx) => {
                      const previous = idx > 0 ? byYear[idx - 1] : null;
                      const pct = percentChange(cell.raw, previous?.raw ?? null);
                      return evaluateDisplay(pct, t);
                    }),
                  },
                ].map((rowItem) => (
                  <tr key={rowItem.key} className="gp-row">
                    <td className="gp-td px-1 md:px-4 font-medium">{rowItem.label}</td>
                    {rowItem.values.map((value, idx) => (
                      <td key={`${rowItem.key}-${idx}`} className="gp-td gp-td-center px-1 md:px-4">
                        {rowItem.key === 'evaluation' && value && typeof value === 'object' ? (
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${evalClass(value.color)}`}>
                            {value.label}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 mb-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <div className="gp-subtitle mb-2">
              {t('energyConsumption.report.reportPrefix')} {rowTitle(row.id)}
            </div>
            <div className="grid gap-2 text-sm text-stone-600">
              {byYear.map((cell, idx) => {
                if (idx === 0) return null;
                const previous = byYear[idx - 1];
                const pct = percentChange(cell.raw, previous?.raw ?? null);
                const category = reportCategory(pct);
                const text = reportText(pct, category, t);
                return (
                  <div key={`${row.id}-report-${cell.year}`}>
                    <span className="font-semibold text-stone-900">{previous.year} → {cell.year}:</span> {text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
