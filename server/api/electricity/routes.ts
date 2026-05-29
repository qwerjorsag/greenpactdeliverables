import { normalizePeriod } from "../shared/time";
import type { RegisterRoutes } from "../types";
import { saveElectricityToLocal } from "./repository";

export const registerElectricityRoutes: RegisterRoutes = (app, context) => {
  app.post("/api/electricity", context.limiter, async (req, res) => {
    try {
      const { profile, operationalData, energyByPeriod } = req.body || {};
      const normalizedPeriods = {
        year1: normalizePeriod(operationalData?.year1, 0),
        year2: normalizePeriod(operationalData?.year2, 1),
        year3: normalizePeriod(operationalData?.year3, 2),
      };
      const normalizedEnergyByPeriod =
        energyByPeriod && typeof energyByPeriod === "object"
          ? energyByPeriod
          : { year1: {}, year2: {}, year3: {} };

      const id = saveElectricityToLocal({
        profile: profile ?? "unknown",
        operationalData: normalizedPeriods,
        energyByPeriod: normalizedEnergyByPeriod,
      });

      res.json({ status: "ok", id });
    } catch (err: any) {
      console.error("Electricity submission error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });
};
