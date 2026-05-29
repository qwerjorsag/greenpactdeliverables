import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import WasteStreamTable from '../components/WasteStreamTable';
import WasteSummaryCard from '../components/WasteSummaryCard';
import { ConsentRow, PrimaryButton } from '../components/ui';
import { apiUrl } from '../lib/api';

type WasteStreamRow = {
  id: string;
  quantity: number | '';
  destination: string;
  recycled: number | '';
  recovered: number | '';
};

export default function Waste() {
  const { t } = useTranslation('waste');

  const [facilityName, setFacilityName] = useState('');
  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);
  const [wasteStreams, setWasteStreams] = useState<WasteStreamRow[]>([
    {
      id: 'mixed',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'paper',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'plastics',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'glass',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'metal',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'organic',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'other',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
  ]);

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const totalWaste = wasteStreams.reduce((sum, r) => sum + (typeof r.quantity === 'number' ? r.quantity : 0), 0);
  const totalRecycled = wasteStreams.reduce((sum, r) => sum + (typeof r.recycled === 'number' ? r.recycled : 0), 0);
  const recyclingRate = totalWaste > 0 ? (totalRecycled / totalWaste) * 100 : 0;
  const yearsForConsumption = periods.slice(0, 3).map((p, idx) => Number(p.period || 0) || 2024 + idx);
  const placeholderValues = {
    energyIntensityM2: [null, null, null],
    energyIntensityRoomNight: [null, null, null],
    emissionsIntensityM2: [null, null, null],
    emissionsIntensityRoomNight: [null, null, null],
    renewableShare: [null, null, null],
  };

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const hasInvalidOperatingDays = periods.some((p) => {
    if (p.operatingDays !== 366) return false;
    const year = parseInt(p.period || '', 10);
    if (!year) return true;
    return !isLeapYear(year);
  });

  const hasEmptyFields = periods.some((p) => {
    return (
      !p.period ||
      p.occupancyRate === '' ||
      p.operatingDays === '' ||
      p.rooms === '' ||
      p.floorArea === ''
    );
  });

  const missingProfile = !profile;
  const missingConsent = !consent;
  const wasteDisabled = isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const wasteTooltip = missingProfile
    ? t('validation.missingProfile')
    : hasInvalidOperatingDays
      ? t('validation.invalidOperatingDays')
      : hasEmptyFields
        ? t('validation.missingFields')
        : missingConsent
          ? t('validation.missingConsent')
          : '';

  const handleSubmit = async () => {
    if (hasInvalidOperatingDays || hasEmptyFields || !consent || !profile) return;
    setIsSubmitting(true);
    const payload = { facilityName, profile, periods, wasteStreams };

    try {
      const response = await fetch(apiUrl('/api/waste'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Waste form submission failed');
      }

      if (typeof window !== 'undefined') {
        const draft = JSON.parse(window.localStorage.getItem('greenpack_draft') || '{}');
        draft.waste = payload;
        window.localStorage.setItem('greenpack_draft', JSON.stringify(draft));
      }

      window.alert(t('alerts.submitted'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Waste form submission failed';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-black/5 font-sans text-stone-900">
      <PageHeader 
        title={t('page.title')}
        description={t('page.description')}
        icon={<Trash2 className="w-6 h-6 text-white" />}
        themeColor="stone"
      />

      <main className="max-w-5xl mx-auto px-3 md:px-6 py-16 bg-transparent">
        <div className="gp-card">
          <div className="mb-12">
            <div className="mb-6">
              <label className="block text-lg font-bold">
                {t('facilityName.label')}
              </label>
              <input
                type="text"
                value={facilityName}
                onChange={(event) => setFacilityName(event.target.value)}
                placeholder={t('facilityName.placeholder')}
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="stone" />
          </div>
          <div>
            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="stone" />
          </div>
        </div>

        <div className="gp-card">
          <WasteStreamTable
            rows={wasteStreams}
            onChange={setWasteStreams}
          />
        </div>

        <WasteSummaryCard
          totalWasteKg={totalWaste}
          recycledKg={totalRecycled}
          recyclingRate={recyclingRate}
        />

        <div className="gp-card">
          <BenchmarksThresholdsTable
            years={yearsForConsumption}
            valuesByYear={placeholderValues}
            ratingMatrixSource="waste"
          />
        </div>

      </main>

      <div className="max-w-5xl mx-auto px-3 md:px-6 pb-16">
        <div className="flex flex-col items-center gap-4">
          <ConsentRow
            checked={consent}
            onChange={setConsent}
            label={t('consent.label')}
            themeColor="stone"
          />
          <span className="group relative inline-block">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={wasteDisabled}
              themeColor="stone"
            >
              {isSubmitting ? t('buttons.generating') : t('buttons.generatePdf')}
          </PrimaryButton>
            {wasteDisabled && (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {wasteTooltip}
              </div>
            )}
          </span>
          <Link
            to="/wasteaudit"
            className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-stone-700 hover:text-white hover:scale-105 transition-all"
          >
            {t('buttons.goToSelfAudit')}
          </Link>
        </div>
      </div>
      
    </div>
  );
}
