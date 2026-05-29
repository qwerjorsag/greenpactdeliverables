import type { RegisterRoutes } from "../types";
import { saveWasteToLocal } from "./repository";

export const registerWasteRoutes: RegisterRoutes = (app, context) => {
  app.post("/api/waste", context.limiter, async (req, res) => {
    try {
      const id = saveWasteToLocal({
        profile: req.body?.profile ?? "unknown",
        facilityName: req.body?.facilityName ?? null,
        periods: Array.isArray(req.body?.periods) ? req.body.periods : [],
        wasteStreams: Array.isArray(req.body?.wasteStreams)
          ? req.body.wasteStreams
          : [],
      });
      res.json({ status: "ok", id });
    } catch (err: any) {
      console.error("Waste submission error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });
};
