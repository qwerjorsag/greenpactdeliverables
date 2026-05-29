import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Home, Tent, Users, Info } from 'lucide-react';

interface AccommodationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AccommodationTypeSelect({ value, onChange }: AccommodationTypeSelectProps) {
  const { t } = useTranslation('submit');

  const types = [
    {
      id: 'hotel',
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      id: 'hostel',
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 'apartment',
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'campsite',
      icon: <Tent className="w-6 h-6" />,
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
        {t('accommodationType.label')}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`relative flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all ${
              value === type.id 
                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-900/5' 
                : 'border-stone-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              value === type.id ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              {type.icon}
            </div>
            <div className="font-bold text-stone-900 mb-1">{t(`accommodationType.${type.id}.title`)}</div>
            <div className="text-xs text-stone-500 leading-relaxed mb-2">{t(`accommodationType.${type.id}.description`)}</div>
            
            {/* Tooltip trigger */}
            <div className="group absolute top-4 right-4">
              <Info className={`w-5 h-5 ${value === type.id ? 'text-emerald-500' : 'text-stone-300'}`} />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-stone-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                {t(`accommodationType.${type.id}.tooltip`)}
                <div className="absolute top-full right-2 w-2 h-2 bg-stone-900 transform rotate-45 -mt-1"></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
