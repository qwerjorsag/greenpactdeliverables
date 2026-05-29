import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  totalWasteKg: number;
  recycledKg: number;
  recyclingRate: number;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WasteSummaryCard({ totalWasteKg, recycledKg, recyclingRate }: Props) {
  const { t } = useTranslation('waste');

  return (
    <div className="gp-card-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3>{t('summary.title')}</h3>
          <ul className="space-y-4 mt-6">
            {[
              {
                label: t('summary.items.totalWaste'),
                value: `${formatWithSpaces(totalWasteKg)} kg`,
              },
              {
                label: t('summary.items.recycledWaste'),
                value: `${formatWithSpaces(recycledKg)} kg`,
              },
              {
                label: t('summary.items.recyclingRate'),
                value: `${recyclingRate.toFixed(1).replace('.', ',')} %`,
              },
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                <span className="text-stone-600 font-medium">{item.label}</span>
                <span className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{t('summary.whyTitle')}</h3>
          <p className="text-stone-500 leading-relaxed mb-6 mt-6">
            {t('summary.whyText')}
          </p>
          <div className="p-6 bg-stone-100 rounded-3xl border border-stone-200">
            <p className="text-stone-700 text-sm font-medium italic">
              {t('summary.quote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
