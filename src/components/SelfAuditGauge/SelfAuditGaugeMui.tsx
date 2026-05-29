import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

type Props = {
  score: number;
  ratingLabel?: string;
  caption?: string;
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const colorForScore = (score: number) => {
  if (score >= 90) return '#047857'; // emerald-700
  if (score >= 70) return '#16a34a'; // green-600
  if (score >= 50) return '#d97706'; // amber-600
  if (score >= 30) return '#c2410c'; // orange-700
  return '#dc2626'; // red-600
};

export default function SelfAuditGaugeMui({ score, ratingLabel, caption }: Props) {
  const value = clamp(score);
  const color = colorForScore(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Gauge
          value={value}
          valueMin={0}
          valueMax={100}
          startAngle={-90}
          endAngle={90}
          innerRadius="70%"
          outerRadius="100%"
          width={192}
          height={112}
          sx={{
            [`& .${gaugeClasses.valueArc}`]: { fill: color },
            [`& .${gaugeClasses.referenceArc}`]: { fill: '#e5e7eb' },
            [`& .${gaugeClasses.valueText}`]: { display: 'none' },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-10">
          <div className="text-xl font-bold text-stone-900">{value} / 100</div>
          {ratingLabel ? (
            <div className="mt-1 text-sm font-semibold" style={{ color }}>
              {ratingLabel}
            </div>
          ) : null}
        </div>
      </div>
      {caption ? <div className="text-sm text-stone-500">{caption}</div> : null}
    </div>
  );
}
