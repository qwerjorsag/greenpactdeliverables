import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Coffee, Home, Utensils, Waves } from 'lucide-react';

export interface Profile {
  id: string;
  icon: React.ReactNode;
}

export const ACCOMMODATION_PROFILES: Profile[] = [
  {
    id: '1',
    icon: <Building className="w-6 h-6" />
  },
  {
    id: '2',
    icon: <Coffee className="w-6 h-6" />
  },
  {
    id: '3',
    icon: <Home className="w-6 h-6" />
  },
  {
    id: '4',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    id: '5',
    icon: <Waves className="w-6 h-6" />
  }
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function AccommodationProfileInput({ value, onChange, themeColor = 'emerald' }: Props) {
  const { t } = useTranslation('electricity');
  const selected = ACCOMMODATION_PROFILES.find((p) => p.id === value);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const hoverTimerRef = React.useRef<number | null>(null);

  const colorClasses = {
    emerald: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
    blue: 'border-blue-500 bg-blue-50/50 text-blue-700',
    orange: 'border-orange-500 bg-orange-50/50 text-orange-700',
    amber: 'border-amber-500 bg-amber-50/50 text-amber-700',
    stone: 'border-stone-500 bg-stone-50/60 text-stone-700',
    yellow: 'border-yellow-500 bg-yellow-50/50 text-yellow-800',
  };

  const activeClass = colorClasses[themeColor];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold" data-pdf-title>{t('profiles.title')}</h3>
      <div data-pdf-show style={{ display: 'none' }}>
        <div className="text-sm font-medium">
          {selected ? t(`profiles.items.${selected.id}.title`) : '-'}
        </div>
        <div data-pdf-space />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-pdf-hide>
        {ACCOMMODATION_PROFILES.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            onMouseEnter={() => {
              if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
              hoverTimerRef.current = window.setTimeout(() => {
                setHoveredId(p.id);
              }, 1000);
            }}
            onMouseLeave={() => {
              if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
              setHoveredId(null);
            }}
            className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.03] cursor-pointer ${
              value === p.id 
                ? activeClass
                : 'border-stone-100 bg-white hover:border-stone-200'
            }`}
          >
            <div className={`mb-3 ${value === p.id ? '' : 'text-stone-400'}`}>
              {p.icon}
            </div>
            <span className="text-sm font-medium leading-snug">
              {t(`profiles.items.${p.id}.title`)}
            </span>
            {hoveredId === p.id && (
              <div className="absolute z-20 left-4 right-4 -bottom-3 translate-y-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700 shadow-lg">
                {t(`profiles.items.${p.id}.tooltip`)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
