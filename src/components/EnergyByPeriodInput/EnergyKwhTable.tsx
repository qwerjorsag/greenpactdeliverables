import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';
import InfoTooltip from '../InfoTooltip';
import UnitSwitch from '../ui/UnitSwitch';

type EnergyByPeriod = Record<string, number | ''>;

type Props = {
  periods: { period: string }[];
  values: EnergyByPeriod[];
  totals: number[];
  onChange: (periodIndex: number, sourceId: string, raw: string) => void;
  formatWithSpaces: (value: number) => string;
};

export default function EnergyKwhTable({
  periods,
  values,
  totals,
  onChange,
  formatWithSpaces,
}: Props) {
  const { t } = useTranslation('electricity');
  const [showUnits, setShowUnits] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3>{showUnits ? t('energyByPeriod.kwhTitle') : t('energyByPeriod.kwhTitlePlain')}</h3>
        <UnitSwitch
          checked={showUnits}
          onToggle={() => setShowUnits((value) => !value)}
          label={t('energyByPeriod.showUnits')}
          color="yellow"
          className="text-xs font-medium text-stone-900"
        />
      </div>

      <div className="gp-table-wrap overflow-y-visible pb-4">
      <table className="gp-table table-auto text-[11px] md:text-sm">
        <thead className="gp-table-head text-[10px] md:text-xs">
          <tr>
            <th className="gp-th gp-th-left px-2 md:px-4 whitespace-normal break-words max-w-[140px] md:max-w-none">
              {t('energyKwhTable.energySource')}
            </th>
            <th className="gp-th px-0.5 md:px-0.5 w-6 text-center hidden md:table-cell"></th>
            {periods.map((p, idx) => (
              <th
                key={`period-${idx}`}
                className={`gp-th gp-th-center px-2 md:px-4 whitespace-normal break-words ${
                  idx === 2 ? 'gp-th-right' : ''
                }`}
              >
                {p.period || t('energyKwhTable.periodFallback', { index: idx + 1 })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENERGY_SOURCES.map((source) => (
            <tr key={source.id} className="gp-row">
              <td className="gp-td px-2 md:px-4">
                <span className="text-sm font-medium text-stone-800">
                  {t(`energySources.${source.id}.name`)}
                </span>
              </td>
              <td className="gp-td px-0.5 md:px-0.5 w-6 text-xs text-stone-700 hidden md:table-cell">
                <div className="flex justify-center">
                  <InfoTooltip
                    label={t('energyKwhTable.explanation')}
                    content={t(`energySources.${source.id}.explanation`)}
                  />
                </div>
              </td>
              {periods.map((_, idx) => {
                const val = values[idx]?.[source.id] ?? '';
                return (
                  <td key={`${source.id}-${idx}`} className="gp-td px-2 md:px-4 align-top">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={typeof val === 'number' ? formatWithSpaces(val) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\s/g, '');
                          onChange(idx, source.id, raw);
                        }}
                        className={`w-full p-1.5 md:p-2 h-[34px] md:h-[38px] border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all placeholder:text-red-500 ${showUnits ? 'pr-10' : 'pr-2'}`}
                        placeholder={t('energyKwhTable.placeholder')}
                      />
                      {showUnits && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] font-medium pointer-events-none">
                          kWh
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="font-bold bg-stone-100 text-stone-900">
            <td className="gp-td px-2 md:px-4 uppercase rounded-bl-xl">
              {t('energyKwhTable.total')}
            </td>
            <td className="gp-td px-0.5 md:px-0.5 w-6 hidden md:table-cell"></td>
            {totals.map((total, idx) => (
              <td
                key={`total-${idx}`}
                className={`gp-td px-2 md:px-4 text-right ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
              >
                {formatWithSpaces(total)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
