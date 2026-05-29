import * as XLSX from "xlsx";
import { localDb } from "../../localDb";
import { quoteIdentifier } from "../shared/db";

type ElectricityExportRow = {
  electricity_form_id: number;
  profile: string;
  created_at: string;
  Year1: string | null;
  Year2: string | null;
  Year3: string | null;
  occupancy_rate_year1: number | null;
  occupancy_rate_year2: number | null;
  occupancy_rate_year3: number | null;
  operating_days_year1: number | null;
  operating_days_year2: number | null;
  operating_days_year3: number | null;
  rooms_year1: number | null;
  rooms_year2: number | null;
  rooms_year3: number | null;
  floor_area_year1: number | null;
  floor_area_year2: number | null;
  floor_area_year3: number | null;
  [key: string]: string | number | null;
};

const electricityPeriods = ["year1", "year2", "year3"] as const;
const electricitySources = [
  "electricity_grid",
  "electricity_renewable",
  "natural_gas",
  "heating_oil",
  "lpg",
  "biomass",
  "district_heating",
  "other",
] as const;

const parseJson = (value: unknown) => {
  if (typeof value !== "string" || !value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

function createElectricityExportRows() {
  const rows = localDb
    .prepare(
      "SELECT id, profile, operational_data_json, energy_by_period_json, created_at FROM electricity ORDER BY id"
    )
    .all() as Array<{
    id: number;
    profile: string;
    operational_data_json: string;
    energy_by_period_json: string;
    created_at: string;
  }>;

  return rows.map((row) => {
    const operationalData = parseJson(row.operational_data_json) as Record<string, any>;
    const energyByPeriod = parseJson(row.energy_by_period_json) as Record<
      string,
      Record<string, number>
    >;

    const exportRow: ElectricityExportRow = {
      electricity_form_id: row.id,
      profile: row.profile,
      created_at: row.created_at,
      Year1: null,
      Year2: null,
      Year3: null,
      occupancy_rate_year1: null,
      occupancy_rate_year2: null,
      occupancy_rate_year3: null,
      operating_days_year1: null,
      operating_days_year2: null,
      operating_days_year3: null,
      rooms_year1: null,
      rooms_year2: null,
      rooms_year3: null,
      floor_area_year1: null,
      floor_area_year2: null,
      floor_area_year3: null,
    };

    for (const periodKey of electricityPeriods) {
      const period = operationalData[periodKey] ?? {};
      const yearNumber = periodKey.replace("year", "");
      exportRow[`Year${yearNumber}`] = period.periodLabel ?? period.period ?? null;
      exportRow[`occupancy_rate_${periodKey}`] = period.occupancyRate ?? null;
      exportRow[`operating_days_${periodKey}`] = period.operatingDays ?? null;
      exportRow[`rooms_${periodKey}`] = period.rooms ?? null;
      exportRow[`floor_area_${periodKey}`] = period.floorArea ?? null;

      const energyValues = energyByPeriod[periodKey] ?? {};
      for (const [sourceKey, kwh] of Object.entries(energyValues)) {
        exportRow[`${sourceKey}_${periodKey}`] = typeof kwh === "number" ? kwh : 0;
      }
    }

    return exportRow;
  });
}

export function createExcelExportBuffer() {
  const tableRows = localDb
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .all() as Array<{ name: string }>;
  const workbook = XLSX.utils.book_new();
  const skippedTables = new Set([
    "admin_users",
    "electricity",
    "submission_recommendations",
    "submissions",
  ]);

  const electricityHeaders = [
    "electricity_form_id",
    "profile",
    "created_at",
    "Year1",
    "occupancy_rate_year1",
    "operating_days_year1",
    "rooms_year1",
    "floor_area_year1",
    "Year2",
    "occupancy_rate_year2",
    "operating_days_year2",
    "rooms_year2",
    "floor_area_year2",
    "Year3",
    "occupancy_rate_year3",
    "operating_days_year3",
    "rooms_year3",
    "floor_area_year3",
    ...electricityPeriods.flatMap((period) =>
      electricitySources.map((source) => `${source}_${period}`)
    ),
  ];
  const electricitySheet = XLSX.utils.json_to_sheet(createElectricityExportRows(), {
    header: electricityHeaders,
  });
  XLSX.utils.book_append_sheet(workbook, electricitySheet, "electricity");

  for (const { name } of tableRows) {
    if (skippedTables.has(name)) continue;

    const columns = (
      localDb.prepare(`PRAGMA table_info(${quoteIdentifier(name)})`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);
    const rows = localDb.prepare(`SELECT * FROM ${quoteIdentifier(name)}`).all();
    const sheet = XLSX.utils.json_to_sheet(rows, { header: columns });
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  }

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}
