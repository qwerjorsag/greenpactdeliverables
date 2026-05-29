import type { RegisterRoutes } from "../types";
import { saveSelfAuditToLocal } from "./repository";
import type { SelfAuditArea } from "./schema";

const normalizeLanguage = (language: unknown) =>
  language === "en" || language === "de" ? language : "cs";

const registerSelfAuditRoute = (
  app: Parameters<RegisterRoutes>[0],
  context: Parameters<RegisterRoutes>[1],
  path: string,
  area: SelfAuditArea,
  logLabel: string
) => {
  app.post(path, context.limiter, async (req, res) => {
    try {
      const { profile, answers, language, totalScore } = req.body || {};
      const id = saveSelfAuditToLocal(area, {
        profile: profile ?? "unknown",
        language: normalizeLanguage(language),
        answers: answers && typeof answers === "object" ? answers : {},
        totalScore: typeof totalScore === "number" ? totalScore : 0,
      });
      res.json({ status: "ok", id });
    } catch (err) {
      console.error(`${logLabel} self-audit submission error:`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

export const registerSelfAuditRoutes: RegisterRoutes = (app, context) => {
  registerSelfAuditRoute(
    app,
    context,
    "/api/electricityselfaudit",
    "electricity",
    "Electricity"
  );
  registerSelfAuditRoute(app, context, "/api/waterselfaudit", "water", "Water");
  registerSelfAuditRoute(app, context, "/api/wasteselfaudit", "waste", "Waste");
};
