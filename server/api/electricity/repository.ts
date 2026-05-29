import { localDb } from "../../localDb";
import { nowIso } from "../shared/time";

const insertElectricity = localDb.prepare(`
  INSERT INTO electricity (
    profile,
    operational_data_json,
    energy_by_period_json,
    created_at
  ) VALUES (?, ?, ?, ?)
`);

export const saveElectricityToLocal = localDb.transaction((payload: any) => {
  const info = insertElectricity.run(
    payload.profile,
    JSON.stringify(payload.operationalData ?? {}),
    JSON.stringify(payload.energyByPeriod ?? {}),
    nowIso()
  );

  return Number(info.lastInsertRowid);
});
