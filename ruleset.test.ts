import { describe, it, expect } from 'vitest';
import { computeSustainabilityKPIs } from './src/shared/ruleset';
import { SubmissionData } from './src/shared/schemas';

const mockBase: SubmissionData = {
  sourceToken: 'TEST',
  language: 'en',
  type: 'hotel',
  details: {
    name: 'Test Hotel',
    country: 'Czech Republic',
    city: 'Prague',
    rooms: 50,
    guestsPerYear: 10000
  },
  energy: { electricityKwh: 100000, gasKwh: 50000, renewablePercentage: 20 },
  water: { totalConsumptionM3: 2000, recycledPercentage: 10 },
  waste: { totalKg: 5000, recycledKg: 2000 },
  honeypot: ''
};

describe('Sustainability Ruleset', () => {
  it('computes correct energy per guest', () => {
    const result = computeSustainabilityKPIs(mockBase);
    // (100000 + 50000) / 10000 = 15
    expect(result.energyPerGuest).toBe(15);
  });

  it('computes correct water per guest', () => {
    const result = computeSustainabilityKPIs(mockBase);
    // 2000 / 10000 = 0.2
    expect(result.waterPerGuest).toBe(0.2);
  });

  it('computes correct waste recycling rate', () => {
    const result = computeSustainabilityKPIs(mockBase);
    // (2000 / 5000) * 100 = 40
    expect(result.wasteRecyclingRate).toBe(40);
  });

  it('assigns correct rating for high performance', () => {
    const highPerf = { ...mockBase, energy: { ...mockBase.energy, electricityKwh: 50000, gasKwh: 0 } };
    const result = computeSustainabilityKPIs(highPerf);
    // energyPerGuest = 5 (score 2)
    // waterPerGuest = 0.2 (score 1 or 2 depending on threshold)
    // waste = 40% (score 1)
    expect(['A', 'B', 'C']).toContain(result.overallRating);
  });

  it('handles zero guests gracefully', () => {
    const zeroGuests = { ...mockBase, details: { ...mockBase.details, guestsPerYear: 0 } };
    const result = computeSustainabilityKPIs(zeroGuests);
    expect(result.energyPerGuest).toBeGreaterThan(0);
    expect(isFinite(result.energyPerGuest)).toBe(true);
  });
});
