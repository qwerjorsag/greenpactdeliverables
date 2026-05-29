export const SUPPORTED_LANGS = ['cs', 'en', 'de'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: SupportedLang = 'cs';

export const NAMESPACES = [
  'common',
  'home',
  'submit',
  'electricity',
  'water',
  'waste',
  'self-audit-electricity',
  'self-audit-water',
  'self-audit-waste',
  'methodology',
  'contact',
  'data',
  'pdf',
] as const;
export type Namespace = (typeof NAMESPACES)[number];
