import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Lightbulb, Wind, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput, { ACCOMMODATION_PROFILES } from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import EnergyEmissionsInput, { ENERGY_SOURCES } from '../components/EnergyEmissionsInput';
import EnergyManagementTable from '../components/EnergyManagementTable';
import EnergyByPeriodInput from '../components/EnergyByPeriodInput';
import EnergyConsumptionTable from '../components/EnergyConsumptionTable';
import EnergyRenewablesSummary from '../components/EnergyRenewablesSummary';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import ElectricitySummaryCard from '../components/ElectricitySummaryCard';
import { generateElectricityVectorPdf } from '../functions/generateElectricityVectorPdf';
import { ConsentRow, PrimaryButton, PdfDownloadModal } from '../components/ui';
import { useElectricityDerived } from '../hooks/useElectricityDerived';
import { useElectricityValidation } from '../hooks/useElectricityValidation';
import { buildElectricityPdfData } from '../functions/buildElectricityPdfData';
import pdfLogoCz from '../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import pdfLogoEn from '../assets/logos/hk_cr_logo_aj_black.png';
import { apiUrl } from '../lib/api';

export default function Electricity() {
  const { i18n, t } = useTranslation('electricity');
  const lang = (i18n.language.split('-')[0] as 'cs' | 'en' | 'de') || 'cs';
  const isCs = lang === 'cs';

  const [facilityName, setFacilityName] = useState('');
  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [consent, setConsent] = useState(false);
  const [energyValues, setEnergyValues] = useState<Record<string, number | ''>>({});
  const [energyByPeriod, setEnergyByPeriod] = useState<Record<string, number | ''>[]>([
    {},
    {},
    {}
  ]);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);

  const { hasInvalidOperatingDays, hasEmptyFields } = useElectricityValidation(periods);
  const missingProfile = !profile;
  const missingConsent = !consent;
  const electricityDisabled = pdfDownloaded || isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const electricityTooltip = missingProfile
    ? t('validation.missingProfile')
    : hasInvalidOperatingDays
      ? t('validation.invalidOperatingDays')
      : hasEmptyFields
        ? t('validation.missingFields')
        : missingConsent
          ? t('validation.missingConsent')
          : '';

  const {
    perPeriodTotals,
    perPeriodIndicators,
    benchmarkValues,
    yearsForConsumption,
    denominatorsForConsumption,
    valuesForConsumption,
  } = useElectricityDerived(periods, energyByPeriod);

  const totalEnergyKwh = perPeriodTotals.reduce((sum, p) => sum + (p?.totalEnergy ?? 0), 0);
  const totalRenewableKwh = energyByPeriod.reduce((sum, periodValues) => {
    const val = periodValues?.electricity_renewable;
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  const renewableShare = totalEnergyKwh > 0 ? (totalRenewableKwh / totalEnergyKwh) * 100 : 0;
  const totalRoomNights = periods.reduce((sum, p) => {
    const occ = typeof p.occupancyRate === 'number' ? p.occupancyRate : 0;
    const days = typeof p.operatingDays === 'number' ? p.operatingDays : 0;
    const rooms = typeof p.rooms === 'number' ? p.rooms : 0;
    return sum + (occ / 100) * days * rooms;
  }, 0);
  const perRoomNightKwh = totalRoomNights > 0 ? totalEnergyKwh / totalRoomNights : 0;


  const handleSubmit = async () => {
    if (hasInvalidOperatingDays || hasEmptyFields || !profile) return;
    setIsSubmitting(true);
    const energyValuesNormalized = ENERGY_SOURCES.reduce<Record<string, number>>((acc, source) => {
      const val = energyValues[source.id];
      acc[source.id] = typeof val === 'number' ? val : 0;
      return acc;
    }, {});
    const energyByPeriodNormalized = energyByPeriod.map((periodValues) =>
      ENERGY_SOURCES.reduce<Record<string, number>>((acc, source) => {
        const val = periodValues?.[source.id];
        acc[source.id] = typeof val === 'number' ? val : 0;
        return acc;
      }, {})
    );
    const periodsByKey = {
      year1: periods[0],
      year2: periods[1],
      year3: periods[2],
    };
    const energyByPeriodByKey = {
      year1: energyByPeriodNormalized[0],
      year2: energyByPeriodNormalized[1],
      year3: energyByPeriodNormalized[2],
    };
    const payload = {
      profile,
      operationalData: periodsByKey,
      energyByPeriod: energyByPeriodByKey,
    };
    try {
      const res = await fetch(apiUrl('/api/electricity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      await res.json().catch(() => ({}));
      setShowPdfModal(true);
    } catch (err) {
      window.alert(t('errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePdf = async () => {
    await i18n.loadNamespaces('pdf');
    const selectedProfile = ACCOMMODATION_PROFILES.find((p) => p.id === profile);
    const accommodationProfileLabel = selectedProfile ? t(`profiles.items.${selectedProfile.id}.title`) : '';
    const pdfData = await buildElectricityPdfData({
      lang,
      profile,
      periods,
      energyByPeriod,
      yearsForConsumption,
      perPeriodTotals,
      perPeriodIndicators,
      benchmarkValues,
      accommodationProfileLabel,
    });

    await generateElectricityVectorPdf({
      language: lang,
      coverTitle: t('page.title'),
      coverColor: [250, 204, 21],
      coverLogoUrl: isCs ? pdfLogoCz : pdfLogoEn,
      coverLogoType: 'PNG',
      facilityName: facilityName.trim() || undefined,
      ...pdfData,
    });
    setPdfDownloaded(true);
    setShowPdfModal(false);
  };

  return (
    <div className="min-h-screen bg-yellow-400/10 font-sans text-stone-900">
      <PageHeader 
        title={t('page.title')}
        description={t('page.description')}
        icon={<Zap className="w-6 h-6" />}
        themeColor="yellow"
        titleClassName="!text-black"
      />

      <main className="max-w-5xl mx-auto px-3 md:px-6 py-16 bg-transparent">
        <div id="pdf-tables">
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
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
              <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="yellow" />
            </div>
              <PeriodDataInput data={periods} onChange={setPeriods} themeColor="yellow" />
          </div>

          <div className="gp-card" data-pdf-card>
            <div className="mb-12">
              <EnergyByPeriodInput
                periods={periods}
                values={energyByPeriod}
                onChange={setEnergyByPeriod}
              />
            </div>
            {/*<div className="mb-12" data-pdf-hide>*/}
            {/*  <EnergyEmissionsInput*/}
            {/*    themeColor="yellow"*/}
            {/*    values={energyValues}*/}
            {/*    onValuesChange={setEnergyValues}*/}
            {/*  />*/}
            {/*</div>*/}
          </div>

          <ElectricitySummaryCard
            totalEnergyKwh={totalEnergyKwh}
            renewableShare={renewableShare}
            perRoomNightKwh={perRoomNightKwh}
          />

          <div className="gp-card" data-pdf-card>
            <EnergyConsumptionTable
              years={yearsForConsumption}
              denominators={denominatorsForConsumption}
              values={valuesForConsumption}
            />
          </div>

          <div className="gp-card" data-pdf-card>
            <EnergyRenewablesSummary
              years={yearsForConsumption}
              values={energyByPeriod}
            />
          </div>

          <div className="gp-card" data-pdf-card>
            <BenchmarksThresholdsTable
              years={yearsForConsumption}
              valuesByYear={benchmarkValues}
              ratingMatrixSource="electricity"
            />
          </div>

          <div className="gp-card" data-pdf-card>
            {periods.slice(0, 3).map((period, idx) => (
              <div key={period.id} className={idx === 0 ? '' : 'mt-12'}>
                <EnergyManagementTable
                  totalEnergyKwh={perPeriodTotals[idx]?.totalEnergy || 0}
                  totalEmissionsKg={perPeriodTotals[idx]?.totalEmissions || 0}
                  floorAreaM2={perPeriodIndicators[idx]?.floorAreaM2 ?? null}
                  roomNights={perPeriodIndicators[idx]?.roomNights ?? null}
                  profileId={profile}
                  periodTitle={t('energyManagement.periodTitle', { period: period.period || '-' })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex flex-col items-center gap-4">
            <ConsentRow
              checked={consent}
              onChange={setConsent}
              label={t('consent.label')}
              themeColor="yellow"
            />
            <span className="group relative inline-block">
              <PrimaryButton
                onClick={handleSubmit}
                disabled={electricityDisabled}
              >
                {pdfDownloaded
                  ? t('buttons.pdfDownloaded')
                  : isSubmitting
                    ? t('buttons.generating')
                    : t('buttons.generatePdf')}
              </PrimaryButton>
              {electricityDisabled && !pdfDownloaded && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {electricityTooltip}
                </div>
              )}
            </span>
            <Link
              to="/electricityaudit"
              className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 hover:scale-105 transition-all"
            >
              {t('buttons.goToSelfAudit')}
            </Link>
          </div>
        </div>

        <PdfDownloadModal
          open={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          onDownload={handleGeneratePdf}
          title={t('modal.title')}
          description={t('modal.description')}
          downloadLabel={t('modal.download')}
          closeLabel={t('modal.close')}
        />
      </main>
      
    </div>
  );
}




