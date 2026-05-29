import type { PeriodData } from '../components/PeriodDataInput';
import { ENERGY_SOURCES } from '../components/EnergyEmissionsInput';
import { BENCHMARK_INDICATORS, type IndicatorKey } from '../components/BenchmarksThresholdsTable';
import { energyBenchmarks, type MetricKey } from '../data/energyBenchmarks';
import i18n from '../i18n';
import { evaluateStatus, getRecommendation, getStatusText } from './electricityStatus';
import { scoreForIndicator } from './electricityScoring';

type EnergyByPeriod = Record<string, number | ''>[];

type PdfDataInput = {
  lang: 'cs' | 'en' | 'de';
  profile: string;
  periods: PeriodData[];
  energyByPeriod: EnergyByPeriod;
  yearsForConsumption: number[];
  perPeriodTotals: Array<{ totalEnergy: number; totalEmissions: number }>;
  perPeriodIndicators: Array<{ roomNights: number | null; floorAreaM2: number | null }>;
  benchmarkValues: Record<IndicatorKey, Array<number | null>>;
  accommodationProfileLabel: string;
};

export const buildElectricityPdfData = async ({
  lang,
  profile,
  periods,
  energyByPeriod,
  yearsForConsumption,
  perPeriodTotals,
  perPeriodIndicators,
  benchmarkValues,
  accommodationProfileLabel,
}: PdfDataInput) => {
  const years = yearsForConsumption.map((y) => y.toString());
  const operationalData = periods.slice(0, 3).map((p) => ({
    period: p.period,
    occupancyRate: typeof p.occupancyRate === 'number' ? p.occupancyRate : null,
    operatingDays: typeof p.operatingDays === 'number' ? p.operatingDays : null,
    rooms: typeof p.rooms === 'number' ? p.rooms : null,
    floorArea: typeof p.floorArea === 'number' ? p.floorArea : null,
  }));

  const energyKwh = energyByPeriod.map((p) =>
    ENERGY_SOURCES.reduce<Record<string, number>>((acc, s) => {
      const v = p?.[s.id];
      acc[s.id] = typeof v === 'number' ? v : 0;
      return acc;
    }, {})
  );
  const energySourceOrder = ENERGY_SOURCES.map((s) => s.id);
  const energySourceLabels = ENERGY_SOURCES.reduce<Record<string, string>>((acc, s) => {
    acc[s.id] = i18n.t(`energySources.${s.id}.name`, { ns: 'electricity', lng: lang });
    return acc;
  }, {});

  const energyEmissionsTons = energyByPeriod.map((p) =>
    ENERGY_SOURCES.reduce<Record<string, number>>((acc, s) => {
      const kwh = typeof p?.[s.id] === 'number' ? (p?.[s.id] as number) : 0;
      acc[s.id] = (kwh * s.ef) / 1000;
      return acc;
    }, {})
  );

  const energyGj = energyByPeriod.map((p) =>
    ENERGY_SOURCES.reduce<Record<string, number>>((acc, s) => {
      const kwh = typeof p?.[s.id] === 'number' ? (p?.[s.id] as number) : 0;
      acc[s.id] = kwh * 0.0036;
      return acc;
    }, {})
  );

  const renewablesSummary = yearsForConsumption.map((year, idx) => {
    const periodValues = energyByPeriod[idx] || {};
    const total = Object.values(periodValues).reduce<number>(
      (sum, v) => sum + (typeof v === 'number' ? v : 0),
      0
    );
    const renewable = typeof periodValues.electricity_renewable === 'number' ? periodValues.electricity_renewable : 0;
    const nonRenewable = Math.max(0, total - renewable);
    const renewablePct = total > 0 ? (renewable / total) * 100 : 0;
    const nonRenewablePct = total > 0 ? (nonRenewable / total) * 100 : 0;
    return {
      year: year.toString(),
      renewableKwh: renewable,
      renewablePct,
      nonRenewableKwh: nonRenewable,
      nonRenewablePct,
    };
  });

  const indicatorLabelMap = BENCHMARK_INDICATORS.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = lang === 'cs' ? row.labelCs : lang === 'de' ? row.labelDe : row.labelEn;
    return acc;
  }, {});
  const benchmarksRows = benchmarkValues as Record<string, Array<number | null>>;
  const benchmarkHeaders = [
    i18n.t('benchmarks.indicator', { ns: 'electricity', lng: lang }),
    ...years,
    i18n.t('benchmarks.scoreForYear', { ns: 'electricity', lng: lang }),
    i18n.t('benchmarks.weight', { ns: 'electricity', lng: lang }),
    i18n.t('benchmarks.weightedScore', { ns: 'electricity', lng: lang }),
  ];

  const benchmarksDataRows = Object.keys(benchmarksRows).map((key) => {
    const rowKey = key as IndicatorKey;
    const rowValues = benchmarksRows[rowKey] || [];
    const first = rowValues[0] ?? null;
    const scoreX = scoreForIndicator(first, rowKey);
    const def = BENCHMARK_INDICATORS.find((row) => row.key === rowKey);
    const weight = def?.weight ?? 0;
    const weighted = scoreX === null ? null : scoreX * weight;
    return [
      indicatorLabelMap[rowKey] ?? rowKey,
      ...rowValues.map((v) => (v === null ? '—' : v.toFixed(2).replace('.', ','))),
      scoreX === null ? '—' : scoreX.toFixed(2).replace('.', ','),
      weight.toFixed(2),
      weighted === null ? '—' : weighted.toFixed(2).replace('.', ','),
    ];
  });

  const totalWeightedPerYear = years.map((_, idx) => {
    let sum = 0;
    let hasAny = false;
    BENCHMARK_INDICATORS.forEach((row) => {
      const v = benchmarksRows[row.key]?.[idx] ?? null;
      const score = scoreForIndicator(v, row.key);
      if (score !== null) {
        sum += score * row.weight;
        hasAny = true;
      }
    });
    return hasAny ? sum.toFixed(2).replace('.', ',') : '—';
  });

  const ratingMatrix =
    lang === 'cs'
      ? (await import('../data/ratingMatrixElectricity/ratingMatrix.cs.json')).default.ratingMatrix
      : lang === 'de'
        ? (await import('../data/ratingMatrixElectricity/ratingMatrix.de.json')).default.ratingMatrix
        : (await import('../data/ratingMatrixElectricity/ratingMatrix.en.json')).default.ratingMatrix;

  const getBand = (score: string) => {
    const num = parseFloat(score.replace(',', '.'));
    if (Number.isNaN(num)) return null;
    return Object.values(ratingMatrix.bands).find((b: any) => num >= b.min && num <= b.max) || null;
  };

  const bands = totalWeightedPerYear.map((score) => {
    const band = getBand(score);
    return band ? band.label.replace(/\s*\(.*\)\s*/g, '') : '—';
  });

  const yearSummaries = years.map((year, idx) => {
    const band = getBand(totalWeightedPerYear[idx]);
    return {
      year,
      rating: band ? band.label.replace(/\s*\(.*\)\s*/g, '') : '—',
      meaning: band ? band.meaning : '—',
      typical: band ? band.typicalProfile : '—',
      next: band ? band.recommendedNextSteps : '—',
    };
  });

  const categoryIndex = Math.max(
    0,
    Math.min(energyBenchmarks.categories.length - 1, Number.parseInt(profile, 10) - 1 || 0)
  );

  const formatValue = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return '—';
    return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ');
  };

  const energyManagementTables = periods.slice(0, 3).map((period, idx) => {
    const totalEnergy = perPeriodTotals[idx]?.totalEnergy ?? null;
    const totalEmissions = perPeriodTotals[idx]?.totalEmissions ?? null;
    const floorArea = perPeriodIndicators[idx]?.floorAreaM2 ?? null;
    const roomNights = perPeriodIndicators[idx]?.roomNights ?? null;
    const energyPerM2 = totalEnergy !== null && floorArea ? totalEnergy / floorArea : null;
    const energyPerRoomNight = totalEnergy !== null && roomNights ? totalEnergy / roomNights : null;
    const emissionsPerM2 = totalEmissions !== null && floorArea ? totalEmissions / floorArea : null;
    const emissionsPerRoomNight = totalEmissions !== null && roomNights ? totalEmissions / roomNights : null;

    const valuesByKey: Record<MetricKey, number | null> = {
      energyPerM2,
      energyPerRoomNight,
      emissionsPerM2,
      emissionsPerRoomNight,
    };

    const rows = energyBenchmarks.metrics.map((metric) => {
      const range = metric.ranges[categoryIndex];
      const value = valuesByKey[metric.key];
      const status = evaluateStatus(value, range, metric.key);
      const statusText = getStatusText(status, metric.key, lang);
      const recommendation = getRecommendation(metric.key, range, value, lang);
      const metricLabel = i18n.t(`energyManagement.metrics.${metric.key}`, { ns: 'electricity', lng: lang });
      const expectedLabel = range ? range.label : '—';
      const resultLabel = `${formatValue(value)} — ${statusText}`;
      return {
        label: metricLabel,
        expected: expectedLabel,
        value: resultLabel,
        evaluation: statusText,
        recommendation,
        status,
      };
    });

    return {
      title: i18n.t('energyManagement.periodTitle', { ns: 'electricity', lng: lang, period: period.period || '-' }),
      rows,
    };
  });

  const totalConsumption = yearsForConsumption.map((_, idx) => {
    const totalEnergy = perPeriodTotals[idx]?.totalEnergy ?? null;
    const converted = totalEnergy === null ? null : totalEnergy * 0.0036;
    const roomNights = perPeriodIndicators[idx]?.roomNights ?? null;
    const floorArea = perPeriodIndicators[idx]?.floorAreaM2 ?? null;
    const normRN = converted === null || !roomNights ? null : converted / roomNights;
    const normM2 = converted === null || !floorArea ? null : converted / floorArea;
    return {
      raw: totalEnergy,
      converted,
      normRN,
      normM2,
    };
  });

  return {
    years,
    operationalData,
    energySourceOrder,
    energySourceLabels,
    energyKwh,
    energyEmissionsTons,
    energyGj,
    totalsByPeriod: perPeriodTotals,
    perPeriodIndicators,
    energyManagementTables,
    renewablesSummary,
    totalConsumption,
    accommodationProfileLabel,
    benchmarks: {
      title: i18n.t('benchmarks.title', { ns: 'electricity', lng: lang }),
      headers: benchmarkHeaders,
      ratingHeaders: {
        rating: ratingMatrix.headers.rating,
        meaning: ratingMatrix.headers.meaning,
        typicalProfile: ratingMatrix.headers.typicalProfile,
        recommendedNextSteps: ratingMatrix.headers.recommendedNextSteps,
      },
      rows: benchmarksDataRows,
      totals: [i18n.t('benchmarks.totalWeightedScore', { ns: 'electricity', lng: lang }), ...totalWeightedPerYear],
      bands: [ratingMatrix.headers.rating, ...bands],
      yearSummaries,
    },
  };
};
