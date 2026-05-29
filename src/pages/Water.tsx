import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import WaterSourceTable from '../components/WaterSourceTable';
import WaterSummaryCard from '../components/WaterSummaryCard';
import { ConsentRow, PrimaryButton } from '../components/ui';
import { apiUrl } from '../lib/api';

type WaterSourceRow = {
  id: string;
  withdrawn: number | '';
  returned: number | '';
};

export default function Water() {
  const { t } = useTranslation('water');

  const [facilityName, setFacilityName] = useState('');
  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);
  const [waterSources, setWaterSources] = useState<WaterSourceRow[]>([
    {
      id: 'municipal',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'groundwater',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'rainwater',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'greywater',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'other',
      withdrawn: '',
      returned: '',
    },
  ]);
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
  const waterDisabled = isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const waterTooltip = missingProfile
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
    const payload = { facilityName, profile, periods, waterSources };

    try {
      const response = await fetch(apiUrl('/api/water'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Water form submission failed');
      }

      if (typeof window !== 'undefined') {
        const draft = JSON.parse(window.localStorage.getItem('greenpack_draft') || '{}');
        draft.water = payload;
        window.localStorage.setItem('greenpack_draft', JSON.stringify(draft));
      }

      window.alert(t('alerts.submitted'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Water form submission failed';
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalWithdrawn = waterSources.reduce((sum, r) => sum + (typeof r.withdrawn === 'number' ? r.withdrawn : 0), 0);
  const recycledRow = waterSources.find((r) => r.id === 'greywater');
  const recycledShare = totalWithdrawn > 0 && recycledRow && typeof recycledRow.withdrawn === 'number'
    ? (recycledRow.withdrawn / totalWithdrawn) * 100
    : 0;
  const totalRoomNights = periods.reduce((sum, p) => {
    const occ = typeof p.occupancyRate === 'number' ? p.occupancyRate : 0;
    const days = typeof p.operatingDays === 'number' ? p.operatingDays : 0;
    const rooms = typeof p.rooms === 'number' ? p.rooms : 0;
    return sum + (occ / 100) * days * rooms;
  }, 0);
  const perRoomNightM3 = totalRoomNights > 0 ? totalWithdrawn / totalRoomNights : 0;
  return (
    <div className="min-h-screen bg-blue-50/90 font-sans text-stone-900">
      <PageHeader 
        title={t('page.title')}
        description={t('page.description')}
        icon={<Droplets className="w-6 h-6 text-white" />}
        themeColor="blue"
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
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="blue" />
          </div>

            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="blue" />

        </div>

        <div className="gp-card">
          <WaterSourceTable
            rows={waterSources}
            onChange={setWaterSources}
          />
        </div>

        <WaterSummaryCard
          totalWaterM3={totalWithdrawn}
          recycledShare={recycledShare}
          perRoomNightM3={perRoomNightM3}
        />

        <div className="gp-card">
          <BenchmarksThresholdsTable
            years={yearsForConsumption}
            valuesByYear={placeholderValues}
            ratingMatrixSource="water"
          />
        </div>
      </main>

      <div className="max-w-5xl mx-auto px-3 md:px-6 pb-16">
        <div className="flex flex-col items-center gap-4">
          <ConsentRow
            checked={consent}
            onChange={setConsent}
            label={t('consent.label')}
            themeColor="blue"
          />
          <span className="group relative inline-block">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={waterDisabled}
              themeColor="blue"
            >
              {isSubmitting ? t('buttons.generating') : t('buttons.generatePdf')}
            </PrimaryButton>
            {waterDisabled && (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {waterTooltip}
              </div>
            )}
          </span>
          <Link
            to="/wateraudit"
            className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white hover:scale-105 transition-all"
          >
            {t('buttons.goToSelfAudit')}
          </Link>
        </div>
      </div>
      
    </div>
  );
}
