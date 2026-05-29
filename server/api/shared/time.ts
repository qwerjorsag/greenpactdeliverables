export const nowIso = () => new Date().toISOString();

export const toIsoString = (value: unknown) => {
  if (!value) return nowIso();
  if (value instanceof Date) return value.toISOString();

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? nowIso() : parsed.toISOString();
};

export const toNumberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const normalizePeriod = (period: any, index: number) => ({
  periodLabel: String(period?.period ?? period?.periodLabel ?? ""),
  occupancyRate: toNumberOrNull(period?.occupancyRate),
  operatingDays: toNumberOrNull(period?.operatingDays),
  rooms: toNumberOrNull(period?.rooms),
  floorArea: toNumberOrNull(period?.floorArea),
  periodKey: period?.id
    ? String(period.id)
    : period?.periodKey
      ? String(period.periodKey)
      : `year${index + 1}`,
});
