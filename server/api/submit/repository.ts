import { localDb } from "../../localDb";
import { nowIso } from "../shared/time";

const insertSubmission = localDb.prepare(`
  INSERT INTO submissions (
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
    @submissionId,
    @sourceToken,
    @language,
    @accommodationType,
    @accommodationName,
    @country,
    @city,
    @rooms,
    @guestsPerYear,
    @electricityKwh,
    @gasKwh,
    @renewablePercentage,
    @waterTotalConsumptionM3,
    @waterRecycledPercentage,
    @wasteTotalKg,
    @wasteRecycledKg,
    @kpiEnergyPerGuest,
    @kpiWaterPerGuest,
    @kpiWasteRecyclingRate,
    @kpiOverallRating,
    @methodologyVersion,
    @ipHash,
    @userAgent,
    @pdfPath,
    @status,
    @createdAt
  )
`);

const insertSubmissionRecommendation = localDb.prepare(`
  INSERT INTO submission_recommendations (
    submission_id,
    recommendation_order,
    recommendation
  ) VALUES (?, ?, ?)
`);

export const saveSubmissionToLocal = localDb.transaction((data: any) => {
  const createdAt = nowIso();
  const info = insertSubmission.run({ ...data, createdAt });
  const submissionDbId = Number(info.lastInsertRowid);
  data.recommendations.forEach((recommendation: string, index: number) => {
    insertSubmissionRecommendation.run(submissionDbId, index + 1, recommendation);
  });
});
