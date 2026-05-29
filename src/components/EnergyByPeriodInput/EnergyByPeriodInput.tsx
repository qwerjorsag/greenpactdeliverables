import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';
import EnergyKwhTable from './EnergyKwhTable';
import EnergyEmissionsTable from './EnergyEmissionsTable';
import EnergyGjTable from './EnergyGjTable';

type EnergyByPeriod = Record<string, number | ''>;

interface Props {
  periods: { period: string }[];
  values: EnergyByPeriod[];
  onChange: (values: EnergyByPeriod[]) => void;
}

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

const formatEmissions = (value: number) => {
  return value
    .toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\u00A0/g, ' ');
};

const formatGj = (value: number) => {
  return value
    .toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\u00A0/g, ' ');
};

export default function EnergyByPeriodInput({ periods, values, onChange }: Props) {
  const { t } = useTranslation('electricity');
  const periodsSlice = periods.slice(0, 3);

  const periodTotalsKwh = periodsSlice.map((_, idx) =>
    ENERGY_SOURCES.reduce((sum, source) => {
      const val = values[idx]?.[source.id];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0)
  );

  const periodTotalsEmissions = periodsSlice.map((_, idx) =>
    ENERGY_SOURCES.reduce((sum, source) => {
      const val = values[idx]?.[source.id];
      const kwh = typeof val === 'number' ? val : 0;
      return sum + (kwh * source.ef) / 1000;
    }, 0)
  );

  const periodTotalsGj = periodTotalsKwh.map((total) => total * 0.0036);

  const handleChange = (periodIndex: number, sourceId: string, raw: string) => {
    const next = values.map((v) => ({ ...v }));
    if (raw === '') {
      next[periodIndex][sourceId] = '';
    } else {
      const num = Math.round(parseFloat(raw));
      next[periodIndex][sourceId] = Number.isNaN(num) ? '' : Math.max(0, num);
    }
    onChange(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3>{t('energyByPeriod.combinedTitle')}</h3>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
        <EnergyKwhTable
          periods={periodsSlice}
          values={values}
          totals={periodTotalsKwh}
          onChange={handleChange}
          formatWithSpaces={formatWithSpaces}
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
        <EnergyEmissionsTable
          periods={periodsSlice}
          values={values}
          totals={periodTotalsEmissions}
          formatEmissions={formatEmissions}
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
        <EnergyGjTable
          periods={periodsSlice}
          values={values}
          totals={periodTotalsGj}
          formatGj={formatGj}
        />
      </div>
    </div>
  );
}
