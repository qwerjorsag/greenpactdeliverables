import type { IndicatorKey } from '../components/BenchmarksThresholdsTable';
import { BENCHMARK_INDICATORS } from '../components/BenchmarksThresholdsTable';

type Thresholds = { goodMax: number; acceptableMax: number; upperRef: number };

export const scoreLowerIsBetter = (value: number | null | undefined, t: Thresholds) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const L = t.goodMax;
  const M = t.acceptableMax;
  const N = t.upperRef;
  const LM = M - L;
  const MN = N - M;
  if (value <= L) return 100;
  if (value <= M) {
    if (LM === 0) return 80;
    return 100 - (value - L) * (20 / LM);
  }
  if (value <= N) {
    if (MN === 0) return 40;
    return 80 - (value - M) * (40 / MN);
  }
  return 20;
};

export const scoreHigherIsBetter = (value: number | null | undefined, t: Thresholds) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const L = t.goodMax;
  const M = t.acceptableMax;
  const N = t.upperRef;
  const ML = L - M;
  const NM = M - N;
  if (value >= L) return 100;
  if (value >= M) {
    if (ML === 0) return 100;
    return 80 + (value - M) * (20 / ML);
  }
  if (value >= N) {
    if (NM === 0) return 80;
    return 40 + (value - N) * (40 / NM);
  }
  return 20;
};

export const scoreForIndicator = (value: number | null, key: IndicatorKey) => {
  const def = BENCHMARK_INDICATORS.find((row) => row.key === key);
  if (!def) return null;
  return def.direction === 'higherIsBetter'
    ? scoreHigherIsBetter(value, def.thresholds)
    : scoreLowerIsBetter(value, def.thresholds);
};
