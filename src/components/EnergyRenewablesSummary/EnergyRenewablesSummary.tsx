import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type EnergyByPeriod = Record<string, number | ''>;

interface Props {
  years: number[];
  values: EnergyByPeriod[];
}

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function EnergyRenewablesSummary({ years, values }: Props) {
  const { t } = useTranslation('electricity');

  const rows = useMemo(() => {
    return years.map((year, idx) => {
      const periodValues = values[idx] || {};
      const total = Object.values(periodValues).reduce<number>(
        (sum, v) => sum + (typeof v === 'number' ? v : 0),
        0
      );
      const renewable = typeof periodValues.electricity_renewable === 'number' ? periodValues.electricity_renewable : 0;
      const nonRenewable = Math.max(0, total - renewable);
      const renewablePct = total > 0 ? (renewable / total) * 100 : 0;
      const nonRenewablePct = total > 0 ? (nonRenewable / total) * 100 : 0;
      return { year, renewable, nonRenewable, renewablePct, nonRenewablePct };
    });
  }, [years, values]);

  const renewableClass = (pct: number) => {
    if (pct > 50) return 'text-emerald-700';
    if (pct < 10) return 'text-red-700';
    if (pct >= 10 && pct <= 25) return 'text-amber-700';
    return 'text-stone-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>
          {t('renewables.title')}
        </h3>
      </div>

      <div className="gp-table-wrap">
        <table className="gp-table table-fixed min-w-0">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left w-10 px-2 md:px-4">{t('renewables.year')}</th>
              <th className="gp-th gp-th-center w-[45%] px-2 md:px-4">
                {t('renewables.renewable')}
              </th>
              <th className="gp-th gp-th-center gp-th-right w-[45%] px-2 md:px-4">
                {t('renewables.nonRenewable')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="gp-row">
                <td className="gp-td font-medium w-10 px-2 md:px-4">{row.year}</td>
                <td className="gp-td gp-td-center w-[45%] px-2 md:px-4">
                  <span className={renewableClass(row.renewablePct)}>
                    {formatWithSpaces(row.renewable)} ({row.renewablePct.toFixed(1).replace('.', ',')}%)
                  </span>
                </td>
                <td className="gp-td gp-td-center w-[45%] px-2 md:px-4">
                  {formatWithSpaces(row.nonRenewable)} ({row.nonRenewablePct.toFixed(1).replace('.', ',')}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
