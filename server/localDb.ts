import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import {
  SELF_AUDIT_QUESTION_KEYS,
  SELF_AUDIT_TABLES,
  type SelfAuditArea,
} from "./api/self-audits/schema";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(projectRoot, "db");
const dbPath = path.join(dbDir, "greenpact.sqlite");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const localDb = new Database(dbPath);

localDb.pragma("journal_mode = WAL");
localDb.pragma("foreign_keys = ON");

type ColumnInfo = { name: string };

const tableExists = (table: string) => {
  const row = localDb
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);
  return Boolean(row);
};

const tableColumns = (table: string) =>
  (localDb.prepare(`PRAGMA table_info(${table})`).all() as ColumnInfo[]).map(
    (column) => column.name
  );

const hasColumn = (table: string, column: string) =>
  tableExists(table) && tableColumns(table).includes(column);

const parseJson = (value: unknown) => {
  if (typeof value !== "string" || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toIso = (value: unknown) => {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const buildSelfAuditTableSql = (tableName: string, questionKeys: readonly string[]) => `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile TEXT NOT NULL,
    language TEXT NOT NULL,
    total_score REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ${questionKeys.map((key) => `${key} REAL NOT NULL DEFAULT 0`).join(",\n    ")}
  );
`;

const buildSelfAuditInsertSql = (tableName: string, questionKeys: readonly string[]) => {
  const columns = [
    "profile",
    "language",
    "total_score",
    "created_at",
    "updated_at",
    ...questionKeys,
  ];
  const params = columns.map((column) => `@${column}`).join(", ");
  return localDb.prepare(`INSERT OR IGNORE INTO ${tableName} (${columns.join(", ")}) VALUES (${params})`);
};

const normalizeSelfAuditAnswers = (
  questionKeys: readonly string[],
  answers: Record<string, unknown>
) =>
  questionKeys.reduce<Record<string, number>>((acc, key) => {
    const value = answers[key];
    acc[key] = typeof value === "number" && Number.isFinite(value) ? value : 0;
    return acc;
  }, {});

function migrateAdminUsersIfNeeded() {
  if (!tableExists("admin_users")) return;
  const columns = tableColumns("admin_users");
  if (!columns.includes("mongo_id")) return;

  localDb.exec(`
    CREATE TABLE IF NOT EXISTS admin_users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO admin_users_new (id, username, password_hash, created_at)
      SELECT id, username, password_hash, COALESCE(created_at, CURRENT_TIMESTAMP)
      FROM admin_users;
    DROP TABLE admin_users;
    ALTER TABLE admin_users_new RENAME TO admin_users;
  `);
}

function migrateLegacySubmissionsIfNeeded() {
  if (!tableExists("submissions") || !hasColumn("submissions", "raw_json")) return;

  const rows = localDb.prepare("SELECT * FROM submissions").all() as any[];
  localDb.exec(`
    CREATE TABLE submissions_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id TEXT NOT NULL UNIQUE,
      source_token TEXT NOT NULL,
      language TEXT NOT NULL,
      accommodation_type TEXT,
      accommodation_name TEXT,
      country TEXT,
      city TEXT,
      rooms INTEGER,
      guests_per_year REAL,
      electricity_kwh REAL,
      gas_kwh REAL,
      renewable_percentage REAL,
      water_total_consumption_m3 REAL,
      water_recycled_percentage REAL,
      waste_total_kg REAL,
      waste_recycled_kg REAL,
      kpi_energy_per_guest REAL,
      kpi_water_per_guest REAL,
      kpi_waste_recycling_rate REAL,
      kpi_overall_rating TEXT,
      methodology_version TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      user_agent TEXT,
      pdf_path TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS submission_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      recommendation_order INTEGER NOT NULL,
      recommendation TEXT NOT NULL,
      FOREIGN KEY (submission_id) REFERENCES submissions_new(id) ON DELETE CASCADE
    );
  `);

  const insertSubmission = localDb.prepare(`
    INSERT OR IGNORE INTO submissions_new (
      id,
      submission_id,
      source_token,
      language,
      accommodation_type,
      accommodation_name,
      country,
      city,
      rooms,
      guests_per_year,
      electricity_kwh,
      gas_kwh,
      renewable_percentage,
      water_total_consumption_m3,
      water_recycled_percentage,
      waste_total_kg,
      waste_recycled_kg,
      kpi_energy_per_guest,
      kpi_water_per_guest,
      kpi_waste_recycling_rate,
      kpi_overall_rating,
      methodology_version,
      ip_hash,
      user_agent,
      pdf_path,
      status,
      created_at
    ) VALUES (
      @id,
      @submission_id,
      @source_token,
      @language,
      @accommodation_type,
      @accommodation_name,
      @country,
      @city,
      @rooms,
      @guests_per_year,
      @electricity_kwh,
      @gas_kwh,
      @renewable_percentage,
      @water_total_consumption_m3,
      @water_recycled_percentage,
      @waste_total_kg,
      @waste_recycled_kg,
      @kpi_energy_per_guest,
      @kpi_water_per_guest,
      @kpi_waste_recycling_rate,
      @kpi_overall_rating,
      @methodology_version,
      @ip_hash,
      @user_agent,
      @pdf_path,
      @status,
      @created_at
    )
  `);
  const insertRecommendation = localDb.prepare(`
    INSERT INTO submission_recommendations (
      submission_id,
      recommendation_order,
      recommendation
    ) VALUES (?, ?, ?)
  `);

  for (const row of rows) {
    const raw = parseJson(row.raw_json) ?? {};
    const computed = parseJson(row.computed_json) ?? {};
    insertSubmission.run({
      id: row.id,
      submission_id: row.submission_id,
      source_token: row.source_token,
      language: row.language,
      accommodation_type: raw.type ?? null,
      accommodation_name: raw.details?.name ?? null,
      country: raw.details?.country ?? null,
      city: raw.details?.city ?? null,
      rooms: raw.details?.rooms ?? null,
      guests_per_year: raw.details?.guestsPerYear ?? null,
      electricity_kwh: raw.energy?.electricityKwh ?? null,
      gas_kwh: raw.energy?.gasKwh ?? null,
      renewable_percentage: raw.energy?.renewablePercentage ?? null,
      water_total_consumption_m3: raw.water?.totalConsumptionM3 ?? null,
      water_recycled_percentage: raw.water?.recycledPercentage ?? null,
      waste_total_kg: raw.waste?.totalKg ?? null,
      waste_recycled_kg: raw.waste?.recycledKg ?? null,
      kpi_energy_per_guest: computed.energyPerGuest ?? null,
      kpi_water_per_guest: computed.waterPerGuest ?? null,
      kpi_waste_recycling_rate: computed.wasteRecyclingRate ?? null,
      kpi_overall_rating: computed.overallRating ?? null,
      methodology_version: row.methodology_version,
      ip_hash: row.ip_hash,
      user_agent: row.user_agent ?? null,
      pdf_path: row.pdf_path ?? null,
      status: row.status,
      created_at: toIso(row.created_at),
    });

    if (Array.isArray(computed.recommendations)) {
      computed.recommendations.forEach((recommendation: string, index: number) => {
        insertRecommendation.run(row.id, index + 1, recommendation);
      });
    }
  }

  localDb.exec(`
    DROP TABLE submissions;
    ALTER TABLE submissions_new RENAME TO submissions;
  `);
}

function migrateLegacyElectricityIfNeeded() {
  if (!tableExists("electricity_forms")) {
    return;
  }

  const electricityTableExists = tableExists("electricity");
  if (!electricityTableExists) {
    localDb.exec(`
      CREATE TABLE IF NOT EXISTS electricity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile TEXT NOT NULL,
        operational_data_json TEXT NOT NULL,
        energy_by_period_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  const formRows = localDb
    .prepare("SELECT id, profile, created_at FROM electricity_forms ORDER BY id")
    .all() as Array<{ id: number; profile: string; created_at: string }>;
  const periodRows = localDb
    .prepare(
      "SELECT electricity_form_id, period_key, period_label, occupancy_rate, operating_days, rooms, floor_area FROM electricity_periods ORDER BY electricity_form_id, period_key"
    )
    .all() as Array<{
      electricity_form_id: number;
      period_key: string;
      period_label: string | null;
      occupancy_rate: number | null;
      operating_days: number | null;
      rooms: number | null;
      floor_area: number | null;
    }>;
  const energyRows = localDb
    .prepare(
      "SELECT electricity_form_id, period_key, source_key, kwh FROM electricity_energy_values ORDER BY electricity_form_id, period_key, source_key"
    )
    .all() as Array<{
      electricity_form_id: number;
      period_key: string;
      source_key: string;
      kwh: number;
    }>;

  const periodsByForm = new Map<
    number,
    Record<string, { periodLabel: string; occupancyRate: number | null; operatingDays: number | null; rooms: number | null; floorArea: number | null }>
  >();
  for (const row of periodRows) {
    const existing = periodsByForm.get(row.electricity_form_id) ?? {};
    existing[row.period_key] = {
      periodLabel: row.period_label ?? "",
      occupancyRate: row.occupancy_rate ?? null,
      operatingDays: row.operating_days ?? null,
      rooms: row.rooms ?? null,
      floorArea: row.floor_area ?? null,
    };
    periodsByForm.set(row.electricity_form_id, existing);
  }

  const energyByForm = new Map<number, Record<string, Record<string, number>>>();
  for (const row of energyRows) {
    const existing = energyByForm.get(row.electricity_form_id) ?? {};
    const periodValues = existing[row.period_key] ?? {};
    periodValues[row.source_key] = typeof row.kwh === "number" ? row.kwh : 0;
    existing[row.period_key] = periodValues;
    energyByForm.set(row.electricity_form_id, existing);
  }

  const insertElectricity = localDb.prepare(`
    INSERT INTO electricity (
      profile,
      operational_data_json,
      energy_by_period_json,
      created_at
    ) VALUES (?, ?, ?, ?)
  `);

  for (const formRow of formRows) {
    const operationalData = {
      year1: periodsByForm.get(formRow.id)?.year1 ?? {},
      year2: periodsByForm.get(formRow.id)?.year2 ?? {},
      year3: periodsByForm.get(formRow.id)?.year3 ?? {},
    };
    const energyByPeriod = {
      year1: energyByForm.get(formRow.id)?.year1 ?? {},
      year2: energyByForm.get(formRow.id)?.year2 ?? {},
      year3: energyByForm.get(formRow.id)?.year3 ?? {},
    };

    insertElectricity.run(
      formRow.profile,
      JSON.stringify(operationalData),
      JSON.stringify(energyByPeriod),
      toIso(formRow.created_at)
    );
  }

  localDb.exec(`
    DROP TABLE electricity_energy_values;
    DROP TABLE electricity_periods;
    DROP TABLE electricity_forms;
  `);
}

function migrateLegacyAreaSelfAuditsIfNeeded() {
  const legacyMappings: Array<{ table: string; area: SelfAuditArea }> = [
    { table: SELF_AUDIT_TABLES.electricity, area: "electricity" },
    { table: SELF_AUDIT_TABLES.water, area: "water" },
    { table: SELF_AUDIT_TABLES.waste, area: "waste" },
  ];

  for (const { table, area } of legacyMappings) {
    if (!tableExists(table) || !hasColumn(table, "answers_json")) continue;

    const questionKeys = SELF_AUDIT_QUESTION_KEYS[area];
    const tempTable = `${table}_new`;
    const rows = localDb.prepare(`SELECT * FROM ${table}`).all() as any[];
    localDb.exec(`
      DROP TABLE IF EXISTS ${tempTable};
      ${buildSelfAuditTableSql(tempTable, questionKeys)}
    `);
    const insertAudit = buildSelfAuditInsertSql(tempTable, questionKeys);

    for (const row of rows) {
      const answers = parseJson(row.answers_json) ?? {};
      const normalizedAnswers = normalizeSelfAuditAnswers(questionKeys, answers);
      insertAudit.run({
        profile: row.profile,
        language: row.language,
        total_score: row.total_score ?? 0,
        created_at: toIso(row.created_at),
        updated_at: toIso(row.updated_at),
        ...normalizedAnswers,
      });
    }

    localDb.exec(`
      DROP TABLE ${table};
      ALTER TABLE ${tempTable} RENAME TO ${table};
    `);
  }
}

function migrateRemoveLegacyAuditIdIfNeeded() {
  for (const area of Object.keys(SELF_AUDIT_TABLES) as SelfAuditArea[]) {
    const table = SELF_AUDIT_TABLES[area];
    if (!tableExists(table) || !hasColumn(table, "legacy_audit_id")) continue;

    const questionKeys = SELF_AUDIT_QUESTION_KEYS[area];
    const tempTable = `${table}_without_legacy_audit_id`;
    const selectColumns = [
      "id",
      "profile",
      "language",
      "total_score",
      "created_at",
      "updated_at",
      ...questionKeys,
    ];

    const rows = localDb
      .prepare(`SELECT ${selectColumns.join(", ")} FROM ${table} ORDER BY id`)
      .all() as Array<Record<string, unknown>>;

    localDb.exec(`
      DROP TABLE IF EXISTS ${tempTable};
      ${buildSelfAuditTableSql(tempTable, questionKeys)}
    `);

    const insert = localDb.prepare(
      `INSERT INTO ${tempTable} (${selectColumns.join(", ")}) VALUES (${selectColumns
        .map((column) => `@${column}`)
        .join(", ")})`
    );

    for (const row of rows) {
      insert.run(row);
    }

    localDb.exec(`
      DROP TABLE ${table};
      ALTER TABLE ${tempTable} RENAME TO ${table};
    `);
  }
}

function migrateUnifiedSelfAuditsIfNeeded() {
  if (!tableExists("self_audits") || !tableExists("self_audit_answers")) return;

  const audits = localDb.prepare("SELECT * FROM self_audits ORDER BY id").all() as Array<{
    id: number;
    area: SelfAuditArea;
    profile: string;
    language: string;
    total_score: number;
    created_at: string;
    updated_at: string;
  }>;

  const answers = localDb.prepare(
    "SELECT self_audit_id, question_key, score FROM self_audit_answers ORDER BY self_audit_id, id"
  ).all() as Array<{ self_audit_id: number; question_key: string; score: number }>;

  const answersByAudit = new Map<number, Record<string, number>>();
  for (const row of answers) {
    const current = answersByAudit.get(row.self_audit_id) ?? {};
    current[row.question_key] = typeof row.score === "number" ? row.score : 0;
    answersByAudit.set(row.self_audit_id, current);
  }

  const insertByArea: Partial<Record<SelfAuditArea, ReturnType<typeof buildSelfAuditInsertSql>>> = {};
  for (const area of Object.keys(SELF_AUDIT_TABLES) as SelfAuditArea[]) {
    insertByArea[area] = buildSelfAuditInsertSql(SELF_AUDIT_TABLES[area], SELF_AUDIT_QUESTION_KEYS[area]);
  }

  for (const audit of audits) {
    if (!audit.area || !(audit.area in SELF_AUDIT_TABLES)) continue;
    const questionKeys = SELF_AUDIT_QUESTION_KEYS[audit.area];
    const insertAudit = insertByArea[audit.area];
    if (!insertAudit) continue;
    const normalizedAnswers = normalizeSelfAuditAnswers(
      questionKeys,
      answersByAudit.get(audit.id) ?? {}
    );

    insertAudit.run({
      profile: audit.profile,
      language: audit.language,
      total_score: audit.total_score ?? 0,
      created_at: toIso(audit.created_at),
      updated_at: toIso(audit.updated_at),
      ...normalizedAnswers,
    });
  }

  localDb.exec(`
    DROP TABLE self_audit_answers;
    DROP TABLE self_audits;
  `);
}

localDb.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id TEXT NOT NULL UNIQUE,
    source_token TEXT NOT NULL,
    language TEXT NOT NULL,
    accommodation_type TEXT,
    accommodation_name TEXT,
    country TEXT,
    city TEXT,
    rooms INTEGER,
    guests_per_year REAL,
    electricity_kwh REAL,
    gas_kwh REAL,
    renewable_percentage REAL,
    water_total_consumption_m3 REAL,
    water_recycled_percentage REAL,
    waste_total_kg REAL,
    waste_recycled_kg REAL,
    kpi_energy_per_guest REAL,
    kpi_water_per_guest REAL,
    kpi_waste_recycling_rate REAL,
    kpi_overall_rating TEXT,
    methodology_version TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    user_agent TEXT,
    pdf_path TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submission_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    recommendation_order INTEGER NOT NULL,
    recommendation TEXT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
  );

  ${buildSelfAuditTableSql(SELF_AUDIT_TABLES.electricity, SELF_AUDIT_QUESTION_KEYS.electricity)}
  ${buildSelfAuditTableSql(SELF_AUDIT_TABLES.water, SELF_AUDIT_QUESTION_KEYS.water)}
  ${buildSelfAuditTableSql(SELF_AUDIT_TABLES.waste, SELF_AUDIT_QUESTION_KEYS.waste)}

  CREATE TABLE IF NOT EXISTS water_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile TEXT NOT NULL,
    facility_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS water_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    water_form_id INTEGER NOT NULL,
    period_label TEXT,
    occupancy_rate REAL,
    operating_days REAL,
    rooms REAL,
    floor_area REAL,
    FOREIGN KEY (water_form_id) REFERENCES water_forms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS water_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    water_form_id INTEGER NOT NULL,
    source_key TEXT NOT NULL,
    withdrawn_m3 REAL,
    returned_m3 REAL,
    FOREIGN KEY (water_form_id) REFERENCES water_forms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS waste_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile TEXT NOT NULL,
    facility_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS waste_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waste_form_id INTEGER NOT NULL,
    period_label TEXT,
    occupancy_rate REAL,
    operating_days REAL,
    rooms REAL,
    floor_area REAL,
    FOREIGN KEY (waste_form_id) REFERENCES waste_forms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS waste_streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waste_form_id INTEGER NOT NULL,
    stream_key TEXT NOT NULL,
    quantity_kg REAL,
    destination TEXT,
    recycled_kg REAL,
    recovered_kg REAL,
    FOREIGN KEY (waste_form_id) REFERENCES waste_forms(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
  CREATE INDEX IF NOT EXISTS idx_electricity_self_audits_created_at ON electricity_self_audits(created_at);
  CREATE INDEX IF NOT EXISTS idx_water_self_audits_created_at ON water_self_audits(created_at);
  CREATE INDEX IF NOT EXISTS idx_waste_self_audits_created_at ON waste_self_audits(created_at);
`);

localDb.transaction(() => {
  migrateAdminUsersIfNeeded();
  migrateLegacySubmissionsIfNeeded();
  migrateLegacyElectricityIfNeeded();
  migrateLegacyAreaSelfAuditsIfNeeded();
  migrateRemoveLegacyAuditIdIfNeeded();
  migrateUnifiedSelfAuditsIfNeeded();
})();

export function getDbPath() {
  return dbPath;
}
