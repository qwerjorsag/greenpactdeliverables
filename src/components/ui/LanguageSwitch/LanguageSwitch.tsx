import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  textClassName?: string;
  borderClassName?: string;
  hoverClassName?: string;
  className?: string;
};

export default function LanguageSwitch({
  textClassName,
  borderClassName,
  hoverClassName,
  className,
}: Props) {
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
      type="button"
      onClick={toggleLanguage}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer',
        textClassName,
        borderClassName,
        hoverClassName,
        className
      )}
    >
      <Globe className="w-4 h-4" />
      {labels[i18n.language.split('-')[0]] || i18n.language}
    </button>
  );
}
