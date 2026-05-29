import { localDb } from "../../localDb";
import {
  SELF_AUDIT_QUESTION_KEYS,
  SELF_AUDIT_TABLES,
  type SelfAuditArea,
} from "./schema";
import { nowIso } from "../shared/time";

const buildInsertStatement = (tableName: string, questionKeys: readonly string[]) => {
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

const insertStatements: Record<SelfAuditArea, ReturnType<typeof buildInsertStatement>> = {
  electricity: buildInsertStatement(
    SELF_AUDIT_TABLES.electricity,
    SELF_AUDIT_QUESTION_KEYS.electricity
  ),
  water: buildInsertStatement(SELF_AUDIT_TABLES.water, SELF_AUDIT_QUESTION_KEYS.water),
  waste: buildInsertStatement(SELF_AUDIT_TABLES.waste, SELF_AUDIT_QUESTION_KEYS.waste),
};

const normalizeAnswers = (
  area: SelfAuditArea,
  answers: Record<string, unknown>
) =>
  SELF_AUDIT_QUESTION_KEYS[area].reduce<Record<string, number>>((acc, key) => {
    const value = answers[key];
    acc[key] = typeof value === "number" && Number.isFinite(value) ? value : 0;
    return acc;
  }, {});

export const saveSelfAuditToLocal = localDb.transaction(
  (
    area: SelfAuditArea,
    payload: {
      profile: string;
      language: string;
      answers: Record<string, unknown>;
      totalScore: number;
    }
  ) => {
    const createdAt = nowIso();
    const normalizedAnswers = normalizeAnswers(area, payload.answers);
    const info = insertStatements[area].run({
      profile: payload.profile,
      language: payload.language,
      total_score: payload.totalScore,
      created_at: createdAt,
      updated_at: createdAt,
      ...normalizedAnswers,
    });

    return Number(info.lastInsertRowid);
  }
);
