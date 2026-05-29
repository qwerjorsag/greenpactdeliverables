import type { MetricKey } from '../data/energyBenchmarks';
import i18n from '../i18n';

export const evaluateStatus = (
  value: number | null,
  range: { min: number; max: number | null },
  key: MetricKey
) => {
  if (value === null || Number.isNaN(value)) return 'unknown';
  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;
  if (key === 'emissionsPerRoomNight') {
    if (value <= upperTypical) return 'lowEmissions';
    if (value <= limit) return 'aboveAverage';
    return 'high';
  }
  if (value <= upperTypical) return 'within';
  if (value <= limit) return 'slightly';
  return 'high';
};

export const getStatusText = (status: string, key: MetricKey, lang: 'cs' | 'en' | 'de') => {
  if (status === 'within') return i18n.t('energyManagement.status.within', { ns: 'electricity', lng: lang });
  if (status === 'slightly') return i18n.t('energyManagement.status.slightly', { ns: 'electricity', lng: lang });
  if (status === 'lowEmissions') return i18n.t('energyManagement.status.lowEmissions', { ns: 'electricity', lng: lang });
  if (status === 'aboveAverage') return i18n.t('energyManagement.status.aboveAverage', { ns: 'electricity', lng: lang });
  if (status === 'high') {
    const specific = `energyManagement.status.high_${key}`;
    const fallback = i18n.t('energyManagement.status.high_generic', { ns: 'electricity', lng: lang });
    return i18n.t(specific, { ns: 'electricity', lng: lang, defaultValue: fallback });
  }
  return '-';
};

export const getRecommendation = (
  key: MetricKey,
  range: { min: number; max: number | null },
  value: number | null,
  lang: 'cs' | 'en' | 'de'
) => {
  if (value === null || Number.isNaN(value)) return '-';
  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;
  const baseKey = `energyManagement.recommendations.${key}`;
  if (value <= upperTypical) return i18n.t(`${baseKey}.within`, { ns: 'electricity', lng: lang });
  if (value <= limit) return i18n.t(`${baseKey}.slightly`, { ns: 'electricity', lng: lang });
  return i18n.t(`${baseKey}.high`, { ns: 'electricity', lng: lang });
};
