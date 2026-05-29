import { localDb } from "../../localDb";

export const getTableCount = (table: string, where = "", params: unknown[] = []) => {
  const row = localDb
    .prepare(`SELECT COUNT(*) AS count FROM ${table} ${where}`)
    .get(...params) as { count: number };
  return row.count;
};

export const quoteIdentifier = (identifier: string) =>
  `"${identifier.replace(/"/g, '""')}"`;
