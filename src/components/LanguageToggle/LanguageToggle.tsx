import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const languages = ['cs', 'en', 'de'] as const;
  const labels: Record<string, string> = { cs: 'CS', en: 'EN', de: 'DE' };

  const toggleLanguage = () => {
    const current = i18n.language.split('-')[0];
    const idx = languages.indexOf(current as (typeof languages)[number]);
    const next = languages[(idx + 1) % languages.length];
    i18n.changeLanguage(next);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors text-white"
    >
      <Globe className="w-4 h-4" />
      {labels[i18n.language.split('-')[0]] || i18n.language}
    </button>
  );
}
