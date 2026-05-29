import { useMemo } from 'react';
import type { PeriodData } from '../components/PeriodDataInput';

const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const useElectricityValidation = (periods: PeriodData[]) => {
  const hasInvalidOperatingDays = useMemo(() => {
    return periods.some((p) => {
      if (p.operatingDays !== 366) return false;
      const year = parseInt(p.period || '', 10);
      if (!year) return true;
      return !isLeapYear(year);
    });
  }, [periods]);

  const hasEmptyFields = useMemo(() => {
    return periods.some((p) => {
      return (
        !p.period ||
        p.occupancyRate === '' ||
        p.operatingDays === '' ||
        p.rooms === '' ||
        p.floorArea === ''
      );
    });
  }, [periods]);

  return { hasInvalidOperatingDays, hasEmptyFields };
};
