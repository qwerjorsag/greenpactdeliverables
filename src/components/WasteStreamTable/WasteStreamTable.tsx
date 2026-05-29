import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip from '../InfoTooltip';

type WasteRow = {
  id: string;
  quantity: number | '';
  destination: string;
  recycled: number | '';
  recovered: number | '';
};

type Props = {
  rows: WasteRow[];
  onChange: (rows: WasteRow[]) => void;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WasteStreamTable({ rows, onChange }: Props) {
  const { t } = useTranslation('waste');

  const handleChange = (rowId: string, field: keyof WasteRow, raw: string) => {
    const next = rows.map((row) => {
      if (row.id !== rowId) return row;
      if (field === 'destination') return { ...row, destination: raw };
      if (raw === '') return { ...row, [field]: '' };
      const num = Math.round(parseFloat(raw));
      return { ...row, [field]: Number.isNaN(num) ? '' : Math.max(0, num) };
    });
    onChange(next);
  };

  const totalQuantity = rows.reduce((sum, r) => sum + (typeof r.quantity === 'number' ? r.quantity : 0), 0);
  const totalRecycled = rows.reduce((sum, r) => sum + (typeof r.recycled === 'number' ? r.recycled : 0), 0);
  const totalRecovered = rows.reduce((sum, r) => sum + (typeof r.recovered === 'number' ? r.recovered : 0), 0);

  const blockSigns = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{t('wasteStreams.title')}</h3>
      </div>

      <div className="gp-table-wrap">
        <table className="gp-table">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left pr-1">{t('wasteStreams.headerStream')}</th>
              <th className="gp-th gp-th-center w-4 px-0"></th>
              <th className="gp-th gp-th-center">{t('wasteStreams.quantity')}</th>
              <th className="gp-th gp-th-center">{t('wasteStreams.destination')}</th>
              <th className="gp-th gp-th-center">{t('wasteStreams.recycled')}</th>
              <th className="gp-th gp-th-center">{t('wasteStreams.recovered')}</th>
              <th className="gp-th gp-th-center">{t('wasteStreams.share')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const qty = typeof row.quantity === 'number' ? row.quantity : 0;
              const share = totalQuantity > 0 ? (qty / totalQuantity) * 100 : 0;
              return (
                <tr key={row.id} className="gp-row">
                  <td className="gp-td font-medium pr-1">{t(`wasteStreams.rows.${row.id}.label`)}</td>
                  <td className="gp-td gp-td-center w-4 px-0">
                    <div className="flex justify-center">
                      <InfoTooltip label="Info" content={t(`wasteStreams.rows.${row.id}.notes`)} />
                    </div>
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.quantity === 'number' ? formatWithSpaces(row.quantity) : ''}
                      onChange={(e) => handleChange(row.id, 'quantity', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      value={row.destination || ''}
                      onChange={(e) => handleChange(row.id, 'destination', e.target.value)}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder={t('wasteStreams.placeholder')}
                    />
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.recycled === 'number' ? formatWithSpaces(row.recycled) : ''}
                      onChange={(e) => handleChange(row.id, 'recycled', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.recovered === 'number' ? formatWithSpaces(row.recovered) : ''}
                      onChange={(e) => handleChange(row.id, 'recovered', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="gp-td gp-td-center">{share.toFixed(1).replace('.', ',')}</td>
                </tr>
              );
            })}

            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td uppercase">{t('wasteStreams.total')}</td>
              <td className="gp-td px-0 w-4"></td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalQuantity)}</td>
              <td className="gp-td"></td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalRecycled)}</td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalRecovered)}</td>
              <td className="gp-td"></td>
              <td className="gp-td"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
