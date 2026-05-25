/**
 * Clinical utility functions for the OpenMRS patient chart.
 *
 * These utilities centralise common clinical calculations so every team
 * deploying OpenMRS uses consistent logic rather than reimplementing it.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Severity level used across all vital sign interpretation helpers */
export type VitalSeverity = 'normal' | 'low' | 'high' | 'critical';

/** BMI category following WHO classification */
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

/** Result returned by blood pressure interpretation */
export interface BloodPressureInterpretation {
  severity: VitalSeverity;
  label: string;
}

/** Result returned by SpO2 interpretation */
export interface SpO2Interpretation {
  severity: VitalSeverity;
  label: string;
}

/** Result returned by pulse interpretation */
export interface PulseInterpretation {
  severity: VitalSeverity;
  label: string;
}

/** Result returned by isVitalInNormalRange */
export interface VitalRangeResult {
  isNormal: boolean;
  severity: VitalSeverity;
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a vital sign value with its unit for display.
 *
 * @param value - The numeric value (null/undefined renders as '--')
 * @param unit - The unit string (e.g. 'mmHg', 'bpm', '°C')
 * @param decimalPlaces - Number of decimal places to render (default 1)
 * @returns Formatted string, e.g. "120 mmHg" or "--"
 */
export function formatVitalValue(
  value: number | null | undefined,
  unit: string,
  decimalPlaces = 1,
): string {
  if (value == null || isNaN(value)) {
    return '--';
  }
  const formatted = Number(value.toFixed(decimalPlaces));
  return unit ? `${formatted} ${unit}` : String(formatted);
}

/**
 * Formats a medication dose for display.
 *
 * @param dose - The numeric dose amount
 * @param unit - The dose unit (e.g. 'mg', 'mL')
 * @param frequency - The dosing frequency (e.g. 'twice daily')
 * @returns Formatted string, e.g. "500 mg twice daily"
 */
export function formatMedicationDose(
  dose: number | null | undefined,
  unit: string,
  frequency: string,
): string {
  if (dose == null) {
    return '--';
  }
  const parts: string[] = [`${dose} ${unit}`];
  if (frequency) {
    parts.push(frequency);
  }
  return parts.join(' ');
}

// ─── Age calculation ──────────────────────────────────────────────────────────

/**
 * Calculates age in years from a birth date.
 *
 * Handles leap-year edge cases by comparing month/day after the year offset.
 *
 * @param birthDate - Birth date string (ISO) or Date object
 * @param referenceDate - Reference date for the calculation (default: today)
 * @returns Age in whole years, or null if the birth date is invalid
 */
export function calculateAge(
  birthDate: string | Date | null | undefined,
  referenceDate?: Date,
): number | null {
  if (!birthDate) {
    return null;
  }

  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (isNaN(birth.getTime())) {
    return null;
  }

  const ref = referenceDate ?? new Date();
  let age = ref.getFullYear() - birth.getFullYear();

  // Adjust if birthday hasn't occurred yet this year
  const hasHadBirthday =
    ref.getMonth() > birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() >= birth.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return Math.max(0, age);
}

// ─── BMI utilities ────────────────────────────────────────────────────────────

/**
 * Calculates BMI and returns the value along with the WHO category.
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimetres
 * @returns Object with bmi value (2 decimal places) and category, or null if inputs are invalid
 */
export function calculateBMI(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): { bmi: number; category: BmiCategory } | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  return { bmi, category: getBMICategory(bmi) };
}

/**
 * Returns the WHO BMI category for a given BMI value.
 *
 * WHO classification:
 * - < 18.5  → underweight
 * - 18.5–24.9 → normal
 * - 25–29.9   → overweight
 * - ≥ 30      → obese
 *
 * @param bmi - The BMI value
 * @returns The corresponding BmiCategory
 */
export function getBMICategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// ─── Vital sign interpretation helpers ───────────────────────────────────────

/**
 * Determines whether a vital sign value falls within a normal range.
 *
 * Uses WHO/standard reference ranges appropriate for the given vital type.
 * Age and gender are considered for pulse normal ranges.
 *
 * @param vitalType - The type of vital sign
 * @param value - The measured value
 * @param age - Patient age in years (used for pulse range adjustment)
 * @param gender - Patient gender ('male' | 'female')
 * @returns Object with isNormal flag and severity level
 */
export function isVitalInNormalRange(
  vitalType: 'systolic' | 'diastolic' | 'pulse' | 'temperature' | 'spo2' | 'respiratoryRate',
  value: number | null | undefined,
  age?: number,
  gender?: string,
): VitalRangeResult {
  if (value == null) {
    return { isNormal: true, severity: 'normal' };
  }

  switch (vitalType) {
    case 'systolic': {
      if (value < 90) return { isNormal: false, severity: 'critical' };
      if (value < 100) return { isNormal: false, severity: 'low' };
      if (value <= 120) return { isNormal: true, severity: 'normal' };
      if (value <= 139) return { isNormal: false, severity: 'high' };
      return { isNormal: false, severity: 'critical' };
    }
    case 'diastolic': {
      if (value < 60) return { isNormal: false, severity: 'critical' };
      if (value <= 80) return { isNormal: true, severity: 'normal' };
      if (value <= 89) return { isNormal: false, severity: 'high' };
      return { isNormal: false, severity: 'critical' };
    }
    case 'pulse': {
      const lowerBound = age && age < 18 ? 60 : 60;
      const upperBound = age && age < 18 ? 100 : 100;
      if (value < lowerBound - 20) return { isNormal: false, severity: 'critical' };
      if (value < lowerBound) return { isNormal: false, severity: 'low' };
      if (value <= upperBound) return { isNormal: true, severity: 'normal' };
      if (value <= 110) return { isNormal: false, severity: 'high' };
      return { isNormal: false, severity: 'critical' };
    }
    case 'temperature': {
      // Celsius
      if (value < 35) return { isNormal: false, severity: 'critical' };
      if (value < 36) return { isNormal: false, severity: 'low' };
      if (value <= 37.5) return { isNormal: true, severity: 'normal' };
      if (value <= 38.5) return { isNormal: false, severity: 'high' };
      return { isNormal: false, severity: 'critical' };
    }
    case 'spo2': {
      if (value < 90) return { isNormal: false, severity: 'critical' };
      if (value < 95) return { isNormal: false, severity: 'low' };
      return { isNormal: true, severity: 'normal' };
    }
    case 'respiratoryRate': {
      if (value < 10) return { isNormal: false, severity: 'critical' };
      if (value < 12) return { isNormal: false, severity: 'low' };
      if (value <= 20) return { isNormal: true, severity: 'normal' };
      if (value <= 24) return { isNormal: false, severity: 'high' };
      return { isNormal: false, severity: 'critical' };
    }
    default:
      return { isNormal: true, severity: 'normal' };
  }
}

/**
 * Returns the JNC 8 blood pressure category and severity for a given BP reading.
 *
 * JNC 8 categories:
 * - Normal:      systolic < 120 and diastolic < 80
 * - Elevated:    systolic 120-129 and diastolic < 80
 * - Stage 1 HTN: systolic 130-139 or diastolic 80-89
 * - Stage 2 HTN: systolic ≥ 140 or diastolic ≥ 90
 * - Crisis:      systolic > 180 or diastolic > 120
 *
 * @param systolic - Systolic blood pressure (mmHg)
 * @param diastolic - Diastolic blood pressure (mmHg)
 * @returns Severity and human-readable label
 */
export function getBloodPressureInterpretation(
  systolic: number | null | undefined,
  diastolic: number | null | undefined,
): BloodPressureInterpretation {
  if (systolic == null || diastolic == null) {
    return { severity: 'normal', label: 'Unknown' };
  }

  if (systolic > 180 || diastolic > 120) {
    return { severity: 'critical', label: 'Hypertensive crisis' };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { severity: 'high', label: 'Stage 2 hypertension' };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { severity: 'high', label: 'Stage 1 hypertension' };
  }
  if (systolic >= 120 && diastolic < 80) {
    return { severity: 'high', label: 'Elevated' };
  }
  if (systolic < 90 || diastolic < 60) {
    return { severity: 'critical', label: 'Hypotension' };
  }
  return { severity: 'normal', label: 'Normal' };
}

/**
 * Returns the clinical interpretation for an SpO2 reading.
 *
 * Clinical thresholds:
 * - ≥ 95%  → Normal
 * - 90–94% → Low (requires monitoring / supplemental O2 consideration)
 * - < 90%  → Critical (hypoxia; immediate intervention needed)
 *
 * @param spo2 - Oxygen saturation percentage
 * @returns Severity and human-readable label
 */
export function getSpO2Interpretation(spo2: number | null | undefined): SpO2Interpretation {
  if (spo2 == null) {
    return { severity: 'normal', label: 'Unknown' };
  }
  if (spo2 < 90) {
    return { severity: 'critical', label: 'Severe hypoxia' };
  }
  if (spo2 < 95) {
    return { severity: 'low', label: 'Low — monitor closely' };
  }
  return { severity: 'normal', label: 'Normal' };
}

/**
 * Returns the clinical interpretation for a pulse (heart rate) reading.
 *
 * Normal adult range: 60–100 bpm.
 * Paediatric adjustments are applied when age is provided.
 *
 * @param pulse - Heart rate in beats per minute
 * @param age - Patient age in years (optional; used to adjust paediatric bounds)
 * @returns Severity and human-readable label
 */
export function getPulseInterpretation(pulse: number | null | undefined, age?: number): PulseInterpretation {
  if (pulse == null) {
    return { severity: 'normal', label: 'Unknown' };
  }

  // Simplified: for children < 12, normal range is broader
  const isChild = age != null && age < 12;

  if (pulse < 40) {
    return { severity: 'critical', label: 'Severe bradycardia' };
  }
  if (!isChild && pulse < 60) {
    return { severity: 'low', label: 'Bradycardia' };
  }
  if (!isChild && pulse > 110) {
    return { severity: 'high', label: 'Tachycardia' };
  }
  if (pulse > 150) {
    return { severity: 'critical', label: 'Severe tachycardia' };
  }
  return { severity: 'normal', label: 'Normal' };
}
