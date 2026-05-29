import React from 'react';

type Props = {
  score: number;
  label?: string;
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const colorForScore = (score: number) => {
  if (score >= 90) return '#047857'; // emerald-700
  if (score >= 70) return '#16a34a'; // green-600
  if (score >= 50) return '#d97706'; // amber-600
  if (score >= 30) return '#c2410c'; // orange-700
  return '#dc2626'; // red-600
};

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

export default function SelfAuditGauge({ score, label }: Props) {
  const value = clamp(score);
  // 180° semicircle gauge: 180 (left) -> 0 (right)
  const needleAngle = 180 - (value / 100) * 180;
  const needleColor = colorForScore(value);

  const startAngle = 0;
  const endAngle = 180;
  const segmentColors = ['#dc2626', '#c2410c', '#d97706', '#16a34a', '#047857'];
  const segmentSize = (startAngle - endAngle) / segmentColors.length;
  const segments = segmentColors.map((color, idx) => {
    const from = startAngle - idx * segmentSize;
    const to = startAngle - (idx + 1) * segmentSize;
    return { from, to, color };
  });

  const cx = 120;
  const cy = 120;
  const r = 80;

  const needleEnd = polarToCartesian(cx, cy, r - 12, needleAngle);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="240" height="120" viewBox="0 0 240 120">
        {segments.map((s, idx) => (
          <path
            key={idx}
            d={describeArc(cx, cy, r, s.from, s.to)}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeLinecap="butt"
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={needleColor}
          strokeWidth="3"
        />
        <circle cx={cx} cy={cy} r="4" fill={needleColor} />
      </svg>
      {label ? <div className="text-sm font-semibold" style={{ color: needleColor }}>{label}</div> : null}
    </div>
  );
}
