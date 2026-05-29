import React from 'react';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  themeColor: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
  titleClassName?: string;
}

export default function PageHeader({ title, description, icon, themeColor, titleClassName }: PageHeaderProps) {
  const { i18n } = useTranslation();

  const themeClasses = {
    emerald: {
      bg: 'bg-emerald-900',
      text: 'text-emerald-100',
      iconBg: 'bg-emerald-500',
      mainText: 'text-white'
    },
    blue: {
      bg: 'bg-blue-900',
      text: 'text-blue-100',
      iconBg: 'bg-blue-500',
      mainText: 'text-white'
    },
    orange: {
      bg: 'bg-orange-900',
      text: 'text-orange-100',
      iconBg: 'bg-orange-500',
      mainText: 'text-white'
    },
    amber: {
      bg: 'bg-amber-900',
      text: 'text-amber-100',
      iconBg: 'bg-amber-500',
      mainText: 'text-white'
    },
    stone: {
      bg: 'bg-stone-900',
      text: 'text-stone-100',
      iconBg: 'bg-stone-500',
      mainText: 'text-white'
    },
    yellow: {
      bg: 'bg-yellow-400',
      text: 'text-black/70',
      iconBg: 'bg-black text-yellow-400',
      mainText: 'text-black'
    }
  };

  const theme = themeClasses[themeColor];

  return (
    <header className={`${theme.bg} ${theme.mainText} py-12 px-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center`}>
            {icon}
          </div>
          <h1 className={`text-4xl font-black uppercase tracking-tighter text-stone-200 ${titleClassName ?? ''}`}>
            {title}
          </h1>
        </div>
        <p className={`${theme.text} max-w-2xl leading-relaxed font-medium`}>
          {description}
        </p>
      </div>
    </header>
  );
}
