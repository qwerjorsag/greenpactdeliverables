import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANG, NAMESPACES, SUPPORTED_LANGS } from './config';

const translationModules = import.meta.glob('./**/*.json');

i18n
  .use(
    resourcesToBackend((lng, ns, cb) => {
      const key = `./${ns}/${lng}.json`;
      const loader = translationModules[key];
      if (!loader) {
        cb(new Error(`Missing translation file: ${key}`), null);
        return;
      }
      loader()
        .then((mod: any) => cb(null, mod.default))
        .catch((err) => cb(err, null));
    }),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: [...SUPPORTED_LANGS],
    fallbackLng: DEFAULT_LANG,
    load: 'languageOnly',
    ns: [...NAMESPACES],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
