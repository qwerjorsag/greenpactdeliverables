import type { RegisterRoutes } from "../types";
import { saveWaterToLocal } from "./repository";

export const registerWaterRoutes: RegisterRoutes = (app, context) => {
  app.post("/api/water", context.limiter, async (req, res) => {
    try {
      const id = saveWaterToLocal({
        profile: req.body?.profile ?? "unknown",
        facilityName: req.body?.facilityName ?? null,
        periods: Array.isArray(req.body?.periods) ? req.body.periods : [],
        waterSources: Array.isArray(req.body?.waterSources)
          ? req.body.waterSources
          : [],
      });
      res.json({ status: "ok", id });
    } catch (err: any) {
      console.error("Water submission error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });
};
