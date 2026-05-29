import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ratingMatrixElectricityEn from '../../data/ratingMatrixElectricity/ratingMatrix.en.json';
import ratingMatrixElectricityCs from '../../data/ratingMatrixElectricity/ratingMatrix.cs.json';
import ratingMatrixElectricityDe from '../../data/ratingMatrixElectricity/ratingMatrix.de.json';
import ratingMatrixWaterSourceEn from '../../data/ratingMatrixWaterSource/ratingMatrix.en.json';
import ratingMatrixWaterSourceCs from '../../data/ratingMatrixWaterSource/ratingMatrix.cs.json';
import ratingMatrixWaterSourceDe from '../../data/ratingMatrixWaterSource/ratingMatrix.de.json';
import ratingMatrixWasteEn from '../../data/ratingMatrixWaste/ratingMatrix.en.json';
import ratingMatrixWasteCs from '../../data/ratingMatrixWaste/ratingMatrix.cs.json';
import ratingMatrixWasteDe from '../../data/ratingMatrixWaste/ratingMatrix.de.json';

type Thresholds = {
  goodMax: number;
  acceptableMax: number;
  upperRef: number;
};

type Direction = 'lowerIsBetter' | 'higherIsBetter';

export type IndicatorKey =
  | 'energyIntensityM2'
  | 'energyIntensityRoomNight'
  | 'emissionsIntensityM2'
  | 'emissionsIntensityRoomNight'
  | 'renewableShare';

export type IndicatorRow = {
  key: IndicatorKey;
  labelEn: string;
  labelCs: string;
  labelDe: string;
  unit: string;
  thresholds: Thresholds;
  weight: number;
  direction: Direction;
};

type InputsState = Record<IndicatorKey, Array<number | null>>;

interface Props {
  years: number[];
  valuesByYear: InputsState;
  ratingMatrixSource?: 'electricity' | 'water' | 'waste';
}

export const BENCHMARK_INDICATORS: IndicatorRow[] = [
  {
    key: 'energyIntensityM2',
    labelEn: 'Energy intensity (kWh/m²)',
    labelCs: 'Intenzita energie (kWh/m²)',
    labelDe: 'Energieintensität (kWh/m²)',
    unit: 'kWh/m²',
    thresholds: { goodMax: 90, acceptableMax: 120, upperRef: 200 },
    weight: 0.25,
    direction: 'lowerIsBetter',
  },
  {
    key: 'energyIntensityRoomNight',
    labelEn: 'Energy intensity (kWh/RN)',
    labelCs: 'Intenzita energie (kWh/pokojonoc)',
    labelDe: 'Energieintensität (kWh/Zimmernacht)',
    unit: 'kWh/RN',
    thresholds: { goodMax: 35, acceptableMax: 45, upperRef: 60 },
    weight: 0.0,
    direction: 'lowerIsBetter',
  },
  {
    key: 'emissionsIntensityM2',
    labelEn: 'Emissions intensity (kg CO₂e/m²)',
    labelCs: 'Intenzita emisí (kg CO₂e/m²)',
    labelDe: 'Emissionsintensität (kg CO₂e/m²)',
    unit: 'kg CO₂e/m²',
    thresholds: { goodMax: 15, acceptableMax: 25, upperRef: 50 },
    weight: 0.25,
    direction: 'lowerIsBetter',
  },
  {
    key: 'emissionsIntensityRoomNight',
    labelEn: 'Emissions intensity (kg CO₂e/RN)',
    labelCs: 'Intenzita emisí (kg CO₂e/pokojonoc)',
    labelDe: 'Emissionsintensität (kg CO₂e/Zimmernacht)',
    unit: 'kg CO₂e/RN',
    thresholds: { goodMax: 5, acceptableMax: 12, upperRef: 20 },
    weight: 0.0,
    direction: 'lowerIsBetter',
  },
  {
    key: 'renewableShare',
    labelEn: 'Renewable electricity share',
    labelCs: 'Podíl obnovitelné elektřiny',
    labelDe: 'Anteil erneuerbarer Elektrizität',
    unit: '%',
    thresholds: { goodMax: 80, acceptableMax: 60, upperRef: 10 },
    weight: 0.15,
    direction: 'higherIsBetter',
  },
];

const scoreLowerIsBetter = (value: number | null | undefined, t: Thresholds): number | null => {
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

const scoreHigherIsBetter = (value: number | null | undefined, t: Thresholds): number | null => {
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

const scoreForYear = (value: number | null, row: IndicatorRow) => {
  return row.direction === 'higherIsBetter'
    ? scoreHigherIsBetter(value, row.thresholds)
    : scoreLowerIsBetter(value, row.thresholds);
};

const weightedScore = (score: number | null, weight: number) => (score === null ? null : score * weight);

const fmt = (value: number | null, digits = 2) => {
  if (value === null) return '—';
  return value.toFixed(digits).replace('.', ',');
};

export default function BenchmarksThresholdsTable({ years, valuesByYear, ratingMatrixSource = 'electricity' }: Props) {
  const { i18n, t } = useTranslation('electricity');
  const lang = i18n.language.split('-')[0];
  const title = t('benchmarks.title');
  const ratingMatrix =
    lang === 'cs'
      ? (ratingMatrixSource === 'water'
          ? ratingMatrixWaterSourceCs.ratingMatrix
          : ratingMatrixSource === 'waste'
            ? ratingMatrixWasteCs.ratingMatrix
            : ratingMatrixElectricityCs.ratingMatrix)
      : lang === 'de'
        ? (ratingMatrixSource === 'water'
            ? ratingMatrixWaterSourceDe.ratingMatrix
            : ratingMatrixSource === 'waste'
              ? ratingMatrixWasteDe.ratingMatrix
              : ratingMatrixElectricityDe.ratingMatrix)
        : (ratingMatrixSource === 'water'
            ? ratingMatrixWaterSourceEn.ratingMatrix
            : ratingMatrixSource === 'waste'
              ? ratingMatrixWasteEn.ratingMatrix
              : ratingMatrixElectricityEn.ratingMatrix);

  const getBand = (score: number | null) => {
    if (score === null || Number.isNaN(score)) return null;
    return (
      Object.values(ratingMatrix.bands).find((b) => score >= b.min && score <= b.max) || null
    );
  };

  const cleanLabel = (label: string) => label.replace(/\s*\(.*\)\s*/g, '');

  const totals = useMemo(() => {
    const perYear = years.map((_, idx) => {
      let sumWeighted = 0;
      let hasAny = false;
      for (const row of BENCHMARK_INDICATORS) {
        const s = scoreForYear(valuesByYear[row.key]?.[idx] ?? null, row);
        const w = weightedScore(s, row.weight);
        if (w !== null) {
          sumWeighted += w;
          hasAny = true;
        }
      }
      return hasAny ? sumWeighted : null;
    });
    return { perYear };
  }, [valuesByYear, years]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{title}</h3>
      </div>
      <div className="gp-table-wrap">
        <table className="gp-table">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left px-1 md:px-4">{t('benchmarks.indicator')}</th>
              {years.map((year) => (
                <th key={year} className="gp-th gp-th-center px-1 md:px-4">{year}</th>
              ))}
              <th className="gp-th gp-th-center px-1 md:px-4 hidden md:table-cell">
                {t('benchmarks.scoreForYear')}
              </th>
              <th className="gp-th gp-th-center px-1 md:px-4 hidden md:table-cell">
                {t('benchmarks.weight')}
              </th>
              <th className="gp-th gp-th-center px-1 md:px-4 hidden md:table-cell">
                {t('benchmarks.weightedScore')}
              </th>
              <th className="gp-th gp-th-center gp-th-right px-1 md:px-4"></th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_INDICATORS.map((row) => {
              const scoreX = scoreForYear(valuesByYear[row.key]?.[0] ?? null, row);
              const wScoreX = weightedScore(scoreX, row.weight);
              const label =
                lang === 'cs' ? row.labelCs : lang === 'de' ? row.labelDe : row.labelEn;
              return (
                <tr key={row.key} className="gp-row">
                  <td className="gp-td px-1 md:px-4 font-medium">{label}</td>
                  {years.map((_, idx) => (
                    <td key={`${row.key}-${idx}`} className="gp-td gp-td-center px-1 md:px-4">
                      {fmt(valuesByYear[row.key]?.[idx] ?? null, 2)}
                    </td>
                  ))}
                  <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell">{fmt(scoreX, 2)}</td>
                  <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell">{row.weight}</td>
                  <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell">{fmt(wScoreX, 2)}</td>
                  <td className="gp-td gp-td-center px-1 md:px-4"></td>
                </tr>
              );
            })}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td px-1 md:px-4 uppercase">
                {t('benchmarks.totalWeightedScore')}
              </td>
              {years.map((_, idx) => (
                <td key={`total-${idx}`} className="gp-td gp-td-center px-1 md:px-4">
                  {fmt(totals.perYear[idx] ?? null, 2)}
                </td>
              ))}
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
            </tr>
            <tr className="bg-stone-50 text-stone-700">
              <td className="gp-td px-1 md:px-4 uppercase">{ratingMatrix.headers.rating}</td>
              {years.map((_, idx) => {
                const band = getBand(totals.perYear[idx] ?? null);
                return (
                  <td key={`tier-${idx}`} className="gp-td gp-td-center px-1 md:px-4">
                    {band ? cleanLabel(band.label) : '—'}
                  </td>
                );
              })}
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
              <td className="gp-td gp-td-center px-1 md:px-4 hidden md:table-cell"></td>
              <td className="gp-td gp-td-center px-1 md:px-4"></td>
              <td className="gp-td gp-td-center px-1 md:px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 text-sm text-stone-700">
        {years.map((year, idx) => {
          const band = getBand(totals.perYear[idx] ?? null);
          return (
            <div key={`desc-${year}`} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-bold text-stone-900">{t('benchmarks.year')} {year}</div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.rating}:</span>{' '}
                {band ? cleanLabel(band.label) : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.meaning}:</span>{' '}
                {band ? band.meaning : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.typicalProfile}:</span>{' '}
                {band ? band.typicalProfile : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.recommendedNextSteps}:</span>{' '}
                {band ? band.recommendedNextSteps : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
