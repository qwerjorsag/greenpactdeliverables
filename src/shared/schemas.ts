import { z } from 'zod';
import { SUPPORTED_LANGS } from '../i18n/config';

export const AccommodationTypeSchema = z.enum(['hotel', 'hostel', 'apartment', 'campsite']);

export const BaseDetailsSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  country: z.string().min(2, 'Country required'),
  city: z.string().min(2, 'City required'),
  rooms: z.number().min(1, 'At least 1 room required'),
  guestsPerYear: z.number().min(0),
});

export const EnergySchema = z.object({
  electricityKwh: z.number().min(0),
  gasKwh: z.number().min(0).optional(),
  renewablePercentage: z.number().min(0).max(100),
});

export const WaterSchema = z.object({
  totalConsumptionM3: z.number().min(0),
  recycledPercentage: z.number().min(0).max(100),
});

export const WasteSchema = z.object({
  totalKg: z.number().min(0),
  recycledKg: z.number().min(0),
});

export const SubmissionSchema = z.object({
  sourceToken: z.string(),
  language: z.enum(SUPPORTED_LANGS),
  type: AccommodationTypeSchema,
  details: BaseDetailsSchema,
  energy: EnergySchema,
  water: WaterSchema,
  waste: WasteSchema,
  honeypot: z.string().max(0).optional(), // Must be empty
});

export type SubmissionData = z.infer<typeof SubmissionSchema>;

export interface ComputedKPIs {
  energyPerGuest: number;
  waterPerGuest: number;
  wasteRecyclingRate: number;
  overallRating: 'A' | 'B' | 'C' | 'D' | 'E';
  recommendations: string[];
}

export interface SubmissionResult {
  submissionId: string;
  methodologyVersion: string;
  raw: SubmissionData;
  computed: ComputedKPIs;
  createdAt: string;
}
