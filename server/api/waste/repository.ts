import { localDb } from "../../localDb";
import { normalizePeriod, nowIso, toNumberOrNull } from "../shared/time";

const insertWasteForm = localDb.prepare(`
  INSERT INTO waste_forms (profile, facility_name, created_at)
  VALUES (?, ?, ?)
`);

const insertWastePeriod = localDb.prepare(`
  INSERT INTO waste_periods (
    waste_form_id,
    period_label,
    occupancy_rate,
    operating_days,
    rooms,
    floor_area
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertWasteStream = localDb.prepare(`
  INSERT INTO waste_streams (
    waste_form_id,
    stream_key,
    quantity_kg,
    destination,
    recycled_kg,
    recovered_kg
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

export const saveWasteToLocal = localDb.transaction((payload: any) => {
  const info = insertWasteForm.run(
    payload.profile,
    payload.facilityName ?? null,
    nowIso()
  );
  const formId = Number(info.lastInsertRowid);

  for (const periodRaw of payload.periods ?? []) {
    const period = normalizePeriod(periodRaw, 0);
    insertWastePeriod.run(
      formId,
      period.periodLabel,
      period.occupancyRate,
      period.operatingDays,
      period.rooms,
      period.floorArea
    );
  }

  for (const stream of payload.wasteStreams ?? []) {
    insertWasteStream.run(
      formId,
      stream?.id ?? "unknown",
      toNumberOrNull(stream?.quantity),
      stream?.destination ?? null,
      toNumberOrNull(stream?.recycled),
      toNumberOrNull(stream?.recovered)
    );
  }

  return formId;
});
