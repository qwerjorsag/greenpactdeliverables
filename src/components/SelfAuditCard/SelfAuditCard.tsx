import React from 'react';

interface SelfAuditCardProps {
  title: string;
  question?: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  ratingLabel?: string;
  ratingColorClass?: string;
  showRatingValueColor?: boolean;
  showRating?: boolean;
  icon: React.ReactNode;
  themeColor?: 'yellow' | 'blue' | 'stone';
}

export default function SelfAuditCard({
  title,
  question,
  description,
  value,
  onChange,
  ratingLabel,
  ratingColorClass,
  showRating = false,
  showRatingValueColor = false,
  icon,
  themeColor = 'yellow',
}: SelfAuditCardProps) {
  const theme = {
    yellow: { icon: 'text-yellow-600', accent: 'accent-yellow-500', value: 'text-yellow-800' },
    blue: { icon: 'text-blue-600', accent: 'accent-blue-500', value: 'text-blue-800' },
    stone: { icon: 'text-stone-700', accent: 'accent-stone-500', value: 'text-stone-700' },
  }[themeColor];

  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-300 shadow-sm">
      <div className={`mb-4 ${theme.icon}`}>{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {question ? (
        <p className="text-sm text-stone-700 mb-3">{question}</p>
      ) : null}

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full ${theme.accent}`}
        />
        <div
          className={`min-w-[84px] text-right text-sm font-semibold ${
            showRatingValueColor ? ratingColorClass ?? theme.value : theme.value
          }`}
        >
          {value} / 100
        </div>
      </div>
      <p className="text-stone-500 text-sm leading-relaxed mt-4">{description}</p>
      {showRating && ratingLabel ? (
        <div className={`mt-3 text-sm font-semibold ${ratingColorClass ?? 'text-stone-800'}`}>
          {ratingLabel}
        </div>
      ) : null}
    </div>
  );
}
