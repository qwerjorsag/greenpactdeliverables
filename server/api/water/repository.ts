import { localDb } from "../../localDb";
import { normalizePeriod, nowIso, toNumberOrNull } from "../shared/time";

const insertWaterForm = localDb.prepare(`
  INSERT INTO water_forms (profile, facility_name, created_at)
  VALUES (?, ?, ?)
`);

const insertWaterPeriod = localDb.prepare(`
  INSERT INTO water_periods (
    water_form_id,
    period_label,
    occupancy_rate,
    operating_days,
    rooms,
    floor_area
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertWaterSource = localDb.prepare(`
  INSERT INTO water_sources (
    water_form_id,
    source_key,
    withdrawn_m3,
    returned_m3
  ) VALUES (?, ?, ?, ?)
`);

export const saveWaterToLocal = localDb.transaction((payload: any) => {
  const info = insertWaterForm.run(
    payload.profile,
    payload.facilityName ?? null,
    nowIso()
  );
  const formId = Number(info.lastInsertRowid);

  for (const periodRaw of payload.periods ?? []) {
    const period = normalizePeriod(periodRaw, 0);
    insertWaterPeriod.run(
      formId,
      period.periodLabel,
      period.occupancyRate,
      period.operatingDays,
      period.rooms,
      period.floorArea
    );
  }

  for (const source of payload.waterSources ?? []) {
    insertWaterSource.run(
      formId,
      source?.id ?? "unknown",
      toNumberOrNull(source?.withdrawn),
      toNumberOrNull(source?.returned)
    );
  }

  return formId;
});
