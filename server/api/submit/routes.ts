import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { computeSustainabilityKPIs, METHODOLOGY_VERSION } from "../../../src/shared/ruleset";
import { SubmissionSchema } from "../../../src/shared/schemas";
import type { RegisterRoutes } from "../types";
import { generateSubmissionPdf } from "./pdf";
import { saveSubmissionToLocal } from "./repository";

export const registerSubmitRoutes: RegisterRoutes = (app, context) => {
  app.post("/api/submit", context.limiter, async (req, res) => {
    try {
      const validatedData = SubmissionSchema.parse(req.body);

      if (!context.allowedSourceTokens.includes(validatedData.sourceToken)) {
        return res.status(403).json({ error: "Invalid source token" });
      }

      const computed = computeSustainabilityKPIs(validatedData);
      const submissionId = uuidv4();
      const ipHash = crypto.createHash("sha256").update(req.ip || "").digest("hex");
      const pdfPath = await generateSubmissionPdf({
        ...validatedData,
        computed,
        submissionId,
      });

      saveSubmissionToLocal({
        submissionId,
        sourceToken: validatedData.sourceToken,
        language: validatedData.language,
        accommodationType: validatedData.type,
        accommodationName: validatedData.details.name,
        country: validatedData.details.country,
        city: validatedData.details.city,
        rooms: validatedData.details.rooms,
        guestsPerYear: validatedData.details.guestsPerYear,
        electricityKwh: validatedData.energy.electricityKwh,
        gasKwh: validatedData.energy.gasKwh ?? null,
        renewablePercentage: validatedData.energy.renewablePercentage,
        waterTotalConsumptionM3: validatedData.water.totalConsumptionM3,
        waterRecycledPercentage: validatedData.water.recycledPercentage,
        wasteTotalKg: validatedData.waste.totalKg,
        wasteRecycledKg: validatedData.waste.recycledKg,
        kpiEnergyPerGuest: computed.energyPerGuest,
        kpiWaterPerGuest: computed.waterPerGuest,
        kpiWasteRecyclingRate: computed.wasteRecyclingRate,
        kpiOverallRating: computed.overallRating,
        methodologyVersion: METHODOLOGY_VERSION,
        ipHash,
        userAgent: req.headers["user-agent"] ?? null,
        pdfPath,
        status: "completed",
        recommendations: computed.recommendations,
      });

      res.json({
        submissionId,
        computed,
        pdfUrl: `/api/report/${submissionId}`,
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      res.status(400).json({ error: err.message || "Invalid submission data" });
    }
  });
};
