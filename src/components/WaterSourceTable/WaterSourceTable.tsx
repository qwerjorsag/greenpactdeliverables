import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip from '../InfoTooltip';

type WaterRow = {
  id: string;
  withdrawn: number | '';
  returned: number | '';
};

type Props = {
  rows: WaterRow[];
  onChange: (rows: WaterRow[]) => void;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WaterSourceTable({ rows, onChange }: Props) {
  const { t } = useTranslation('water');

  const handleChange = (rowId: string, field: keyof WaterRow, raw: string) => {
    const next = rows.map((row) => {
      if (row.id !== rowId) return row;
      if (raw === '') return { ...row, [field]: '' };
      const num = Math.round(parseFloat(raw));
      return { ...row, [field]: Number.isNaN(num) ? '' : Math.max(0, num) };
    });
    onChange(next);
  };

  const blockSigns = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const computed = rows.map((row) => {
    const withdrawn = typeof row.withdrawn === 'number' ? row.withdrawn : 0;
    const returned = typeof row.returned === 'number' ? row.returned : 0;
    const consumed = Math.max(0, withdrawn - returned);
    return { ...row, withdrawn, returned, consumed };
  });

  const totalWithdrawn = computed.reduce((sum, r) => sum + r.withdrawn, 0);
  const totalReturned = computed.reduce((sum, r) => sum + r.returned, 0);
  const totalConsumed = computed.reduce((sum, r) => sum + r.consumed, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{t('waterSources.title')}</h3>
      </div>

      <div className="gp-table-wrap">
        <table className="gp-table">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left">{t('waterSources.headerSource')}</th>
              <th className="gp-th gp-th-center w-6 hidden md:table-cell"></th>
              <th className="gp-th gp-th-center">{t('waterSources.withdrawn')}</th>
              <th className="gp-th gp-th-center">{t('waterSources.returned')}</th>
              <th className="gp-th gp-th-center">{t('waterSources.consumed')}</th>
              <th className="gp-th gp-th-center gp-th-right">{t('waterSources.share')}</th>
            </tr>
          </thead>
          <tbody>
            {computed.map((row) => {
              const share = totalWithdrawn > 0 ? (row.withdrawn / totalWithdrawn) * 100 : 0;
              return (
                <tr key={row.id} className="gp-row">
                  <td className="gp-td font-medium">{t(`waterSources.rows.${row.id}.label`)}</td>
                  <td className="gp-td gp-td-center w-6 hidden md:table-cell">
                    <div className="flex justify-center">
                      <InfoTooltip label="Info" content={t(`waterSources.rows.${row.id}.tooltip`)} />
                    </div>
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.withdrawn === 'number' && row.withdrawn !== 0 ? formatWithSpaces(row.withdrawn) : ''}
                      onChange={(e) => handleChange(row.id, 'withdrawn', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.returned === 'number' && row.returned !== 0 ? formatWithSpaces(row.returned) : ''}
                      onChange={(e) => handleChange(row.id, 'returned', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="gp-td gp-td-center">{formatWithSpaces(row.consumed)}</td>
                  <td className="gp-td gp-td-center">{share.toFixed(1).replace('.', ',')}</td>
                </tr>
              );
            })}

            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td uppercase">{t('waterSources.total')}</td>
              <td className="gp-td gp-td-center hidden md:table-cell"></td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalWithdrawn)}</td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalReturned)}</td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalConsumed)}</td>
              <td className="gp-td gp-td-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
