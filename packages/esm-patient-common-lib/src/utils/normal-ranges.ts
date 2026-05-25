/**
 * Normal range constants for vital signs, based on WHO and JNC 8 clinical guidelines.
 *
 * IMPLEMENTATION NOTES:
 * - These are adult reference ranges. Paediatric adjustments are handled in
 *   the interpretation helper functions (clinical-utils.ts) using patient age.
 * - All temperature values are in Celsius. If a deployment uses Fahrenheit,
 *   the UI layer should convert before calling interpretation helpers.
 * - The 'criticalHigh' and 'criticalLow' thresholds indicate values requiring
 *   immediate clinical attention (not just monitoring).
 *
 * WHY these ranges matter:
 * In resource-limited settings, clinicians see dozens of patients per shift and cannot
 * always mentally recall all normal ranges. Centralising these constants ensures
 * consistent alerting logic across every OpenMRS deployment worldwide.
 *
 * Sources:
 * - Blood pressure: JNC 8 (2014) and WHO Cardiovascular disease prevention guidelines
 * - SpO2: WHO Global Pulse Oximetry Project
 * - Pulse: AHA normal heart rate recommendations
 * - Temperature: WHO clinical standards; fever threshold 37.5°C oral
 * - Respiratory rate: WHO IMCI guidelines
 */

export interface VitalNormalRange {
  /** Absolute low — below this value is a medical emergency */
  criticalLow: number;
  /** Clinical low — below this value warrants monitoring */
  low: number;
  /** Upper boundary of normal (inclusive) */
  high: number;
  /** Absolute high — above this value is a medical emergency */
  criticalHigh: number;
  /** SI unit for this vital sign */
  unit: string;
}

/**
 * Standard normal ranges for adult vital signs.
 * All temperature values are in Celsius.
 * Adjust paediatric ranges using age-based logic in interpretation helpers.
 */
export const NORMAL_RANGES: Record<string, VitalNormalRange> = {
  /** Systolic blood pressure in mmHg */
  systolicBloodPressure: {
    criticalLow: 90,
    low: 100,
    high: 120,
    criticalHigh: 180,
    unit: 'mmHg',
  },

  /** Diastolic blood pressure in mmHg */
  diastolicBloodPressure: {
    criticalLow: 60,
    low: 60,
    high: 80,
    criticalHigh: 120,
    unit: 'mmHg',
  },

  /** Pulse / heart rate in beats per minute */
  pulse: {
    criticalLow: 40,
    low: 60,
    high: 100,
    criticalHigh: 150,
    unit: 'bpm',
  },

  /** Peripheral oxygen saturation (SpO2) as a percentage */
  oxygenSaturation: {
    criticalLow: 90,
    low: 95,
    high: 100,
    criticalHigh: 100,
    unit: '%',
  },

  /** Body temperature in degrees Celsius */
  temperature: {
    criticalLow: 35,
    low: 36,
    high: 37.5,
    criticalHigh: 40,
    unit: '°C',
  },

  /** Respiratory rate in breaths per minute */
  respiratoryRate: {
    criticalLow: 8,
    low: 12,
    high: 20,
    criticalHigh: 30,
    unit: 'breaths/min',
  },
} as const;

/** BMI thresholds following WHO classification */
export const BMI_THRESHOLDS = {
  /** Below this: Underweight */
  UNDERWEIGHT: 18.5,
  /** Below this (and ≥ UNDERWEIGHT): Normal weight */
  NORMAL: 25,
  /** Below this (and ≥ NORMAL): Overweight */
  OVERWEIGHT: 30,
  // ≥ OVERWEIGHT: Obese
} as const;
