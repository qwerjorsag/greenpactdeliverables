import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Methodology() {
  const { t } = useTranslation('methodology');

  return (
    <div className="min-h-screen bg-emerald-50/50 font-sans text-stone-900">
      <header className="bg-emerald-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">{t('title')}</h1>
          <p className="mt-3 text-emerald-100 font-medium">{t('subtitle')}</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-stone-700">
          {t('intro')}
        </div>
      </main>
    </div>
  );
}
