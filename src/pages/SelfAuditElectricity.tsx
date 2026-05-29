import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Lightbulb,
  Sliders,
  Fan,
  Sun,
  ClipboardCheck,
  PlugZap,
  Wrench,
  Leaf,
  FileText,
  Building,
  Users,
  BedDouble,
  Shirt,
  Radar,
  KeyRound,
  Thermometer,
  DoorClosed,
  MessageSquareText,
  QrCode,
  LineChart,
  ClipboardList,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SelfAuditCard from '../components/SelfAuditCard';
import AccommodationProfileInput, { ACCOMMODATION_PROFILES } from '../components/AccommodationProfileInput';
import selfAuditData from '../data/selfAuditCardsQuestions/selfAuditElectricity.json';
import { getSelfAuditRatingLabel, getSelfAuditRatingColorClass } from '../functions/selfAuditRating';
import SelfAuditSummary from '../components/SelfAuditSummary';
import { generateElectricitySelfAuditPdf } from '../functions/generateElectricitySelfAuditPdf';
import { ConsentRow, PrimaryButton } from '../components/ui';
import { captureGaugePng } from '../functions/captureGaugePng';
import pdfLogoCz from '../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import pdfLogoEn from '../assets/logos/hk_cr_logo_aj_black.png';
import SelfAuditDownloadWindow from '../components/SelfAuditDownloadWindow';
import { apiUrl } from '../lib/api';

type AuditCard = {
  id: string;
  weight?: number;
  title: LocalizedText;
  description: LocalizedText;
  question?: LocalizedText;
  icon: React.ReactNode;
};

type LocalizedText = {
  cs?: string;
  en?: string;
  de?: string;
  [key: string]: string | undefined;
};

const ICONS: Record<string, React.ReactNode> = {
  lighting: <Lightbulb className="w-10 h-10" />,
  controls: <Sliders className="w-10 h-10" />,
  equipment: <Fan className="w-10 h-10" />,
  renewables: <Sun className="w-10 h-10" />,
  energy_audit: <ClipboardCheck className="w-10 h-10" />,
  led_lighting_replacement: <Lightbulb className="w-10 h-10" />,
  energy_saving_appliances: <PlugZap className="w-10 h-10" />,
  hvac_maintenance: <Wrench className="w-10 h-10" />,
  use_renewable_energy_sources: <Leaf className="w-10 h-10" />,
  purchase_green_electricity: <FileText className="w-10 h-10" />,
  building_energy_insulation: <Building className="w-10 h-10" />,
  employee_training_energy_behavior: <Users className="w-10 h-10" />,
  laundry_towels_on_request: <Shirt className="w-10 h-10" />,
  laundry_bed_linen_frequency: <BedDouble className="w-10 h-10" />,
  lighting_motion_sensors_common_areas: <Radar className="w-10 h-10" />,
  lighting_room_keycard_activators: <KeyRound className="w-10 h-10" />,
  heating_standard_temperature_with_override: <Thermometer className="w-10 h-10" />,
  ac_only_with_closed_windows: <DoorClosed className="w-10 h-10" />,
  guest_behavior_signs_turn_off: <MessageSquareText className="w-10 h-10" />,
  guest_behavior_qr_flyer_info: <QrCode className="w-10 h-10" />,
  management_energy_monitoring_frequency: <LineChart className="w-10 h-10" />,
  management_record_temp_requests_for_prediction: <ClipboardList className="w-10 h-10" />,
};

const CARDS: AuditCard[] = selfAuditData.cards.map((card) => ({
  id: card.id,
  weight: typeof card.weight === 'number' ? card.weight : 1,
  title: card.title,
  description: card.description,
  question: card.question,
  icon: ICONS[card.id] ?? <Zap className="w-10 h-10" />,
}));

export default function SelfAuditElectricity() {
  const { i18n, t } = useTranslation('self-audit-electricity');
  const { t: tElectricity } = useTranslation('electricity');
  const lang = (i18n.language.split('-')[0] as 'cs' | 'en' | 'de') || 'cs';
  const isCs = lang === 'cs';
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [facilityName, setFacilityName] = useState('');
  const [profile, setProfile] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const getText = (value?: LocalizedText) => value?.[lang] ?? value?.en ?? value?.cs ?? '';

  const scores = useMemo(() => {
    return CARDS.reduce<Record<string, number>>((acc, card) => {
      const raw = inputs[card.id];
      const value = typeof raw === 'number' ? raw : 0;
      acc[card.id] = Math.min(100, Math.max(0, Math.round(value)));
      return acc;
    }, {});
  }, [inputs]);

  const totalScore = useMemo(() => {
    let sum = 0;
    let weightSum = 0;
    CARDS.forEach((card) => {
      const w = card.weight ?? 1;
      sum += (scores[card.id] ?? 0) * w;
      weightSum += w;
    });
    if (weightSum === 0) return 0;
    return Math.round(sum / weightSum);
  }, [scores]);

  const ratingLabel = getSelfAuditRatingLabel(totalScore, lang);


  const handleChange = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setInputs((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleSubmit = () => {
    if (!consent || !profile) return;
    setIsSubmitting(true);
    setShowEvaluation(true);

    const answers = CARDS.reduce<Record<string, number>>((acc, card) => {
      acc[card.id] = scores[card.id] ?? 0;
      return acc;
    }, {});

    fetch(apiUrl('/api/electricityselfaudit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        answers,
        totalScore,
        language: lang,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Request failed');
        }
        return res.json();
      })
      .then(() => {
        setShowPdfModal(true);
      })
      .catch(() => {
        window.alert(t('errors.submitFailed'));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleGeneratePdf = async () => {
    await i18n.loadNamespaces('pdf');
    const selectedProfile = ACCOMMODATION_PROFILES.find((p) => p.id === profile);
    const accommodationProfileLabel = selectedProfile ? tElectricity(`profiles.items.${selectedProfile.id}.title`) : undefined;
    const gaugeImage = await captureGaugePng({
      elementId: 'self-audit-gauge',
      score: totalScore,
      ratingLabel,
    }).catch(() => undefined);
    await generateElectricitySelfAuditPdf({
      language: lang,
      coverColor: [250, 204, 21],
      coverLogoUrl: isCs ? pdfLogoCz : pdfLogoEn,
      coverLogoType: 'PNG',
      title: t('pdf.title'),
      accommodationProfileLabel,
      facilityName: facilityName.trim() || undefined,
      gaugeImage,
      cards: CARDS.map((card) => ({
        title: getText(card.title),
        question: card.question ? getText(card.question) : undefined,
        description: getText(card.description),
        score: scores[card.id] ?? 0,
        ratingLabel: getSelfAuditRatingLabel(scores[card.id] ?? null, lang),
      })),
      totalScore,
      totalRatingLabel: ratingLabel,
    });
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

      <main className="max-w-5xl mx-auto px-6 py-16 bg-transparent">
        <div className="mb-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CARDS.map((card) => (
            <SelfAuditCard
              key={card.id}
              title={getText(card.title)}
              question={card.question ? getText(card.question) : undefined}
              description={getText(card.description)}
              value={scores[card.id] ?? 0}
              onChange={(value) => handleChange(card.id, value)}
              ratingLabel={showEvaluation ? getSelfAuditRatingLabel(scores[card.id] ?? null, lang) : ''}
              ratingColorClass={getSelfAuditRatingColorClass(scores[card.id] ?? null)}
              showRatingValueColor={showEvaluation}
              showRating={showEvaluation}
              icon={card.icon}
              themeColor="yellow"
            />
          ))}
        </div>

        <SelfAuditSummary score={totalScore} ratingLabel={ratingLabel} show={showEvaluation} />

        <div className="flex justify-center mt-8">
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
                disabled={!consent || isSubmitting || !profile}
                themeColor="yellow"
                className="mt-3"
              >
                {isSubmitting ? t('buttons.evaluating') : t('buttons.evaluate')}
              </PrimaryButton>
              {(!profile || !consent || isSubmitting) && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {!profile
                    ? t('tooltip.missingProfile')
                    : !consent
                      ? t('tooltip.missingConsent')
                      : t('tooltip.evaluating')}
                </div>
              )}
            </span>
          </div>
        </div>
      </main>
      <SelfAuditDownloadWindow
        open={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        onDownload={handleGeneratePdf}
        title={t('modal.title')}
        description={t('modal.description')}
        downloadLabel={t('modal.download')}
        closeLabel={t('modal.close')}
        themeColor="yellow"
      />
    </div>
  );
}




