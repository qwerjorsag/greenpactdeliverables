import i18n from '../i18n';

export type SelfAuditRatingKey =
  | 'excellent'
  | 'very_good'
  | 'sufficient'
  | 'weak'
  | 'insufficient'
  | 'empty';

export function getSelfAuditRating(score: number | null) {
  if (score === null || Number.isNaN(score)) return 'empty';
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'very_good';
  if (score >= 50) return 'sufficient';
  if (score >= 30) return 'weak';
  return 'insufficient';
}

export function getSelfAuditRatingLabel(score: number | null, lang: 'cs' | 'en' | 'de') {
  const key = getSelfAuditRating(score);
  if (key === 'empty') return '';
  const map: Record<Exclude<SelfAuditRatingKey, 'empty'>, string> = {
    excellent: 'selfAuditRating.excellent',
    very_good: 'selfAuditRating.veryGood',
    sufficient: 'selfAuditRating.sufficient',
    weak: 'selfAuditRating.weak',
    insufficient: 'selfAuditRating.insufficient',
  };
  return i18n.t(map[key as Exclude<SelfAuditRatingKey, 'empty'>], { ns: 'common', lng: lang });
}

export function getSelfAuditRatingColorClass(score: number | null) {
  const key = getSelfAuditRating(score);
  if (key === 'excellent') return 'text-emerald-700';
  if (key === 'very_good') return 'text-green-600';
  if (key === 'sufficient') return 'text-amber-600';
  if (key === 'weak') return 'text-orange-700';
  if (key === 'insufficient') return 'text-red-600';
  return 'text-stone-500';
}
