import { SubmissionData, ComputedKPIs } from './schemas';

export const METHODOLOGY_VERSION = '1.0.0';

/**
 * Transformation logic based on the project methodology.
 * In a real scenario, these coefficients would come from the Excel model.
 */
export function computeSustainabilityKPIs(data: SubmissionData): ComputedKPIs {
  const guests = data.details.guestsPerYear || 1;
  
  // 1. Energy KPI (kWh per guest)
  const totalEnergy = data.energy.electricityKwh + (data.energy.gasKwh || 0);
  const energyPerGuest = totalEnergy / guests;

  // 2. Water KPI (m3 per guest)
  const waterPerGuest = data.water.totalConsumptionM3 / guests;

  // 3. Waste KPI (Recycling rate %)
  const wasteRecyclingRate = data.waste.totalKg > 0 
    ? (data.waste.recycledKg / data.waste.totalKg) * 100 
    : 0;

  // 4. Rating Logic (Simplified placeholder)
  // Thresholds would be specific to accommodation type in a real methodology
  let score = 0;
  if (energyPerGuest < 15) score += 2;
  else if (energyPerGuest < 30) score += 1;

  if (waterPerGuest < 0.2) score += 2;
  else if (waterPerGuest < 0.5) score += 1;

  if (wasteRecyclingRate > 50) score += 2;
  else if (wasteRecyclingRate > 30) score += 1;

  let overallRating: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
  if (score >= 5) overallRating = 'A';
  else if (score >= 4) overallRating = 'B';
  else if (score >= 3) overallRating = 'C';
  else if (score >= 2) overallRating = 'D';

  // 5. Recommendations (Bilingual logic should be handled by caller or via keys)
  const recommendations: string[] = [];
  if (energyPerGuest > 30) recommendations.push('rec_high_energy');
  if (waterPerGuest > 0.5) recommendations.push('rec_high_water');
  if (wasteRecyclingRate < 30) recommendations.push('rec_low_recycling');
  if (data.energy.renewablePercentage < 20) recommendations.push('rec_low_renewables');

  return {
    energyPerGuest: parseFloat(energyPerGuest.toFixed(2)),
    waterPerGuest: parseFloat(waterPerGuest.toFixed(4)),
    wasteRecyclingRate: parseFloat(wasteRecyclingRate.toFixed(1)),
    overallRating,
    recommendations,
  };
}
