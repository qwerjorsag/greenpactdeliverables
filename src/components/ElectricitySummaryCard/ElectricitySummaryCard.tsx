import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  totalEnergyKwh: number;
  renewableShare: number;
  perRoomNightKwh: number;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function ElectricitySummaryCard({ totalEnergyKwh, renewableShare, perRoomNightKwh }: Props) {
  const { t } = useTranslation('electricity');

  return (
    <div className="gp-card-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3>{t('summary.title')}</h3>
          <ul className="space-y-4 mt-6">
            {[
              {
                label: t('summary.items.totalEnergy'),
                value: `${formatWithSpaces(totalEnergyKwh)} kWh`,
              },
              {
                label: t('summary.items.renewableShare'),
                value: `${renewableShare.toFixed(1).replace('.', ',')} %`,
              },
              {
                label: t('summary.items.perRoomNight'),
                value: `${perRoomNightKwh.toFixed(2).replace('.', ',')} kWh`,
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
          <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
            <p className="text-yellow-900 text-sm font-medium italic">
              {t('summary.quote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
