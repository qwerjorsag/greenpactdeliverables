import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type SelfAuditArea = "electricity" | "water" | "waste";

export const SELF_AUDIT_TABLES: Record<SelfAuditArea, string> = {
  electricity: "electricity_self_audits",
  water: "water_self_audits",
  waste: "waste_self_audits",
};

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

const selfAuditDataFiles: Record<SelfAuditArea, string> = {
  electricity: "selfAuditElectricity.json",
  water: "selfAuditWater.json",
  waste: "selfAuditWaste.json",
};

const assertSafeColumnName = (value: unknown, fileName: string) => {
  if (typeof value !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid self-audit question id in ${fileName}: ${String(value)}`);
  }
  return value;
};

const loadQuestionKeys = (fileName: string) => {
  const filePath = path.join(
    projectRoot,
    "src",
    "data",
    "selfAuditCardsQuestions",
    fileName
  );
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    cards?: Array<{ id?: unknown }>;
  };

  if (!Array.isArray(parsed.cards)) {
    throw new Error(`Missing cards array in ${fileName}`);
  }

  return parsed.cards.map((card) => assertSafeColumnName(card.id, fileName));
};

export const SELF_AUDIT_QUESTION_KEYS: Record<SelfAuditArea, readonly string[]> = {
  electricity: loadQuestionKeys(selfAuditDataFiles.electricity),
  water: loadQuestionKeys(selfAuditDataFiles.water),
  waste: loadQuestionKeys(selfAuditDataFiles.waste),
};
