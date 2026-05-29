import { useMemo } from 'react';
import type { PeriodData } from '../components/PeriodDataInput';
import { ENERGY_SOURCES } from '../components/EnergyEmissionsInput';
import type { IndicatorKey } from '../components/BenchmarksThresholdsTable';

type EnergyByPeriod = Record<string, number | ''>[];

export const useElectricityDerived = (
  periods: PeriodData[],
  energyByPeriod: EnergyByPeriod
) => {
  const perPeriodTotals = useMemo(() => {
    return periods.slice(0, 3).map((_, idx) => {
      const valuesForPeriod = energyByPeriod[idx] || {};
      const totalEnergy = ENERGY_SOURCES.reduce((sum, source) => {
        const val = valuesForPeriod[source.id];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
      const totalEmissions = ENERGY_SOURCES.reduce((sum, source) => {
        const val = valuesForPeriod[source.id];
        const kwh = typeof val === 'number' ? val : 0;
        return sum + kwh * source.ef;
      }, 0);
      return { totalEnergy, totalEmissions };
    });
  }, [energyByPeriod, periods]);

  const perPeriodIndicators = useMemo(() => {
    return periods.slice(0, 3).map((period) => {
      const roomNights =
        typeof period.occupancyRate === 'number' &&
        typeof period.operatingDays === 'number' &&
        typeof period.rooms === 'number'
          ? (period.occupancyRate / 100) * period.operatingDays * period.rooms
          : null;
      const floorAreaM2 = typeof period.floorArea === 'number' ? period.floorArea : null;
      return { roomNights, floorAreaM2 };
    });
  }, [periods]);

  const benchmarkValues = useMemo(() => {
    const valuesByYear: Record<IndicatorKey, Array<number | null>> = {
      energyIntensityM2: [],
      energyIntensityRoomNight: [],
      emissionsIntensityM2: [],
      emissionsIntensityRoomNight: [],
      renewableShare: [],
    };

    periods.slice(0, 3).forEach((_, idx) => {
      const totalEnergy = perPeriodTotals[idx]?.totalEnergy ?? 0;
      const totalEmissions = perPeriodTotals[idx]?.totalEmissions ?? 0;
      const floorArea = perPeriodIndicators[idx]?.floorAreaM2 ?? null;
      const roomNights = perPeriodIndicators[idx]?.roomNights ?? null;
      const energyIntensityM2 = floorArea && floorArea > 0 ? totalEnergy / floorArea : null;
      const energyIntensityRoomNight = roomNights && roomNights > 0 ? totalEnergy / roomNights : null;
      const emissionsIntensityM2 = floorArea && floorArea > 0 ? totalEmissions / floorArea : null;
      const emissionsIntensityRoomNight = roomNights && roomNights > 0 ? totalEmissions / roomNights : null;

      const periodValues = energyByPeriod[idx] || {};
      const totalKwh = Object.values(periodValues).reduce<number>(
        (sum, v) => sum + (typeof v === 'number' ? v : 0),
        0
      );
      const renewableKwh = typeof periodValues.electricity_renewable === 'number' ? periodValues.electricity_renewable : 0;
      const renewableShare = totalKwh > 0 ? (renewableKwh / totalKwh) * 100 : null;

      valuesByYear.energyIntensityM2.push(energyIntensityM2);
      valuesByYear.energyIntensityRoomNight.push(energyIntensityRoomNight);
      valuesByYear.emissionsIntensityM2.push(emissionsIntensityM2);
      valuesByYear.emissionsIntensityRoomNight.push(emissionsIntensityRoomNight);
      valuesByYear.renewableShare.push(renewableShare);
    });

    return valuesByYear;
  }, [periods, perPeriodTotals, perPeriodIndicators, energyByPeriod]);

  const yearsForConsumption = useMemo(() => {
    return periods.slice(0, 3).map((p, idx) => {
      const parsed = parseInt(p.period || '', 10);
      if (!Number.isNaN(parsed)) return parsed;
      const base = new Date().getFullYear();
      return base + idx;
    });
  }, [periods]);

  const denominatorsForConsumption = useMemo(() => {
    return yearsForConsumption.reduce<Record<number, { roomNights: number | null; floorAreaM2: number | null }>>(
      (acc, year, idx) => {
        acc[year] = {
          roomNights: perPeriodIndicators[idx]?.roomNights ?? null,
          floorAreaM2: perPeriodIndicators[idx]?.floorAreaM2 ?? null,
        };
        return acc;
      },
      {}
    );
  }, [yearsForConsumption, perPeriodIndicators]);

  const valuesForConsumption = useMemo(() => {
    const base: Record<string, Record<number, number | null>> = {
      'total-energy': {},
      'total-energy-alt': {},
    };
    yearsForConsumption.forEach((year, idx) => {
      const total = perPeriodTotals[idx]?.totalEnergy ?? null;
      base['total-energy'][year] = total;
      base['total-energy-alt'][year] = total;
    });
    return base;
  }, [yearsForConsumption, perPeriodTotals]);

  return {
    perPeriodTotals,
    perPeriodIndicators,
    benchmarkValues,
    yearsForConsumption,
    denominatorsForConsumption,
    valuesForConsumption,
  };
};
