import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

type Props = {
  textClassName?: string;
  borderClassName?: string;
  hoverClassName?: string;
  activeClassName?: string;
  className?: string;
};

export default function LanguageSwitchAlt({
  textClassName,
  borderClassName,
  hoverClassName,
  activeClassName,
  className,
}: Props) {
  const { i18n } = useTranslation();
  const languages = ['cs', 'en', 'de'] as const;
  const labels: Record<string, string> = { cs: 'CS', en: 'EN', de: 'DE' };
  const current = i18n.language.split('-')[0];

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-1 py-1 text-[12px] font-bold uppercase tracking-widest',
        textClassName,
        borderClassName,
        className
      )}
      role="group"
      aria-label="Language switcher"
    >
      {languages.map((lng) => {
        const isActive = current === lng;
        return (
          <button
            key={lng}
            type="button"
            onClick={() => i18n.changeLanguage(lng)}
            aria-pressed={isActive}
            className={clsx(
              'px-2.5 py-1 rounded-full transition-colors text-[12px] cursor-pointer',
              hoverClassName,
              isActive && (activeClassName ?? 'bg-white/20')
            )}
          >
            {labels[lng]}
          </button>
        );
      })}
    </div>
  );
}
