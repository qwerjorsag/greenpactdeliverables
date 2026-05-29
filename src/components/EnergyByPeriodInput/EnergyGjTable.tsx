import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';
import UnitSwitch from '../ui/UnitSwitch';

type EnergyByPeriod = Record<string, number | ''>;

type Props = {
  periods: { period: string }[];
  values: EnergyByPeriod[];
  totals: number[];
  formatGj: (value: number) => string;
};

export default function EnergyGjTable({
  periods,
  values,
  totals,
  formatGj,
}: Props) {
  const { t } = useTranslation('electricity');
  const [showUnits, setShowUnits] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3>{showUnits ? t('energyByPeriod.gjTitle') : t('energyByPeriod.gjTitlePlain')}</h3>
        <UnitSwitch
          checked={showUnits}
          onToggle={() => setShowUnits((value) => !value)}
          label={t('energyByPeriod.showUnits')}
          color="yellow"
          className="text-xs font-medium text-stone-900"
        />
      </div>

      <div className="gp-table-wrap overflow-y-visible pb-4">
        <table className="gp-table tabular-nums table-fixed">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left whitespace-normal break-words max-w-[140px] md:max-w-none w-1/3">
                {t('energyKwhTable.energySource')}
              </th>
              {periods.map((p, idx) => (
                <th
                  key={`gj-period-${idx}`}
                  className={`gp-th gp-th-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'gp-th-right' : ''}`}
                >
                  {p.period || t('energyKwhTable.periodFallback', { index: idx + 1 })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENERGY_SOURCES.map((source) => (
              <tr key={`${source.id}-gj`} className="gp-row">
                <td className="gp-td">
                  <span className="text-sm font-medium text-stone-800">
                    {t(`energySources.${source.id}.name`)}
                  </span>
                </td>
                {periods.map((_, idx) => {
                  const val = values[idx]?.[source.id];
                  const kwh = typeof val === 'number' ? val : 0;
                  const gj = kwh * 0.0036;
                  return (
                    <td key={`${source.id}-gj-${idx}`} className="gp-td gp-td-center w-1/3">
                      <span className="whitespace-nowrap">
                        {formatGj(gj)}
                        {showUnits && <span className="text-xs text-stone-500"> GJ</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td uppercase rounded-bl-xl">
                {t('energyKwhTable.total')}
              </td>
              {totals.map((total, idx) => (
                <td
                  key={`gj-total-${idx}`}
                  className={`gp-td gp-td-center w-1/3 ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
                >
                  <span className="whitespace-nowrap">
                    {formatGj(total)}
                    {showUnits && <span className="text-xs text-stone-500"> GJ</span>}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
