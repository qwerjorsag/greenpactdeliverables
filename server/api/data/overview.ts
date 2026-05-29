import { getTableCount } from "../shared/db";

export function getLocalDataOverview(username: string) {
  const now = Date.now();
  const last24Hours = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last28Days = new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString();
  const submissionTables = [
    "submissions",
    "electricity",
    "water_forms",
    "waste_forms",
  ] as const;

  const countRecentSubmissions = (sinceIso: string) =>
    submissionTables.reduce(
      (total, table) =>
        total +
        getTableCount(table, "WHERE datetime(created_at) >= datetime(?)", [sinceIso]),
      0
    );

  const selfAuditTables = [
    "electricity_self_audits",
    "water_self_audits",
    "waste_self_audits",
  ] as const;

  const countRecentSelfAudits = (sinceIso: string) =>
    selfAuditTables.reduce(
      (total, table) =>
        total + getTableCount(table, "WHERE datetime(created_at) >= datetime(?)", [sinceIso]),
      0
    );

  return {
    username,
    counts: {
      electricity: getTableCount("electricity"),
      water: getTableCount("water_forms"),
      waste: getTableCount("waste_forms"),
      electricitySelfAudits: getTableCount("electricity_self_audits"),
      waterSelfAudits: getTableCount("water_self_audits"),
      wasteSelfAudits: getTableCount("waste_self_audits"),
    },
    submissionStats: {
      last24Hours: countRecentSubmissions(last24Hours),
      last7Days: countRecentSubmissions(last7Days),
      last28Days: countRecentSubmissions(last28Days),
    },
    selfAuditStats: {
      last24Hours: countRecentSelfAudits(last24Hours),
      last7Days: countRecentSelfAudits(last7Days),
      last28Days: countRecentSelfAudits(last28Days),
    },
  };
}
