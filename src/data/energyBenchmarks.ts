export type MetricKey =
  | 'energyPerM2'
  | 'energyPerRoomNight'
  | 'emissionsPerM2'
  | 'emissionsPerRoomNight';

export const energyBenchmarks = {
  categories: [1, 2, 3, 4, 5],
  metrics: [
    {
      key: 'energyPerM2',
      ranges: [
        { min: 50, max: 90, label: '50-90' },
        { min: 80, max: 120, label: '80-120' },
        { min: 90, max: 140, label: '90-140' },
        { min: 150, max: 220, label: '150-220' },
        { min: 220, max: null, label: '220-320' },
      ],
    },
    {
      key: 'energyPerRoomNight',
      ranges: [
        { min: 20, max: 35, label: '20-35' },
        { min: 25, max: 40, label: '25-40' },
        { min: 30, max: 45, label: '30-45' },
        { min: 45, max: 75, label: '45-75' },
        { min: 70, max: null, label: '70-110' },
      ],
    },
    {
      key: 'emissionsPerM2',
      ranges: [
        { min: 0, max: 15, label: '≤ 15' },
        { min: 15, max: 25, label: '15-25' },
        { min: 20, max: 30, label: '20-30' },
        { min: 35, max: 50, label: '35-50' },
        { min: 45, max: 70, label: '45-70' },
      ],
    },
    {
      key: 'emissionsPerRoomNight',
      ranges: [
        { min: 0, max: 5, label: '≤ 5' },
        { min: 6, max: 9, label: '6-9' },
        { min: 6, max: 10, label: '6-10' },
        { min: 11, max: 14, label: '11-14' },
        { min: 15, max: 28, label: '15-28' },
      ],
    },
  ],
} as const;




