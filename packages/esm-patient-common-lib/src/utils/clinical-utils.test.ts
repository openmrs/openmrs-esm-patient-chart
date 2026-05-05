import {
  calculateAge,
  calculateBMI,
  formatMedicationDose,
  formatVitalValue,
  getBMICategory,
  getBloodPressureInterpretation,
  getPulseInterpretation,
  getSpO2Interpretation,
  isVitalInNormalRange,
} from './clinical-utils';

describe('formatVitalValue', () => {
  it('returns -- for null values', () => {
    expect(formatVitalValue(null, 'mmHg')).toBe('--');
  });

  it('returns -- for undefined values', () => {
    expect(formatVitalValue(undefined, 'bpm')).toBe('--');
  });

  it('formats a value with unit', () => {
    expect(formatVitalValue(120, 'mmHg')).toBe('120 mmHg');
  });

  it('rounds to specified decimal places', () => {
    expect(formatVitalValue(37.555, '°C', 1)).toBe('37.6 °C');
  });

  it('returns value without unit when unit is empty', () => {
    expect(formatVitalValue(98, '')).toBe('98');
  });
});

describe('calculateAge', () => {
  it('returns null for null birthDate', () => {
    expect(calculateAge(null)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(calculateAge('not-a-date')).toBeNull();
  });

  it('calculates age correctly for someone born 30 years ago', () => {
    const ref = new Date('2025-01-01');
    const birth = new Date('1995-01-01');
    expect(calculateAge(birth, ref)).toBe(30);
  });

  it('handles leap year birthday correctly — birthday not yet occurred', () => {
    const ref = new Date('2025-02-28');
    const birth = new Date('2000-02-29');
    // Feb 29 hasn't occurred yet in 2025, so age is 24, not 25
    expect(calculateAge(birth, ref)).toBe(24);
  });

  it('returns 0 for newborns', () => {
    const ref = new Date('2025-01-15');
    const birth = new Date('2025-01-10');
    expect(calculateAge(birth, ref)).toBe(0);
  });
});

describe('calculateBMI', () => {
  it('returns null for null weight', () => {
    expect(calculateBMI(null, 170)).toBeNull();
  });

  it('returns null for zero height', () => {
    expect(calculateBMI(70, 0)).toBeNull();
  });

  it('calculates BMI correctly for normal weight adult', () => {
    // 70 kg, 175 cm → BMI = 70 / (1.75^2) = 22.86
    const result = calculateBMI(70, 175);
    expect(result?.bmi).toBeCloseTo(22.86, 1);
    expect(result?.category).toBe('normal');
  });

  it('classifies obese correctly', () => {
    // 100 kg, 170 cm → BMI = 34.6
    const result = calculateBMI(100, 170);
    expect(result?.category).toBe('obese');
  });
});

describe('getBMICategory', () => {
  it('returns underweight for BMI < 18.5', () => {
    expect(getBMICategory(17)).toBe('underweight');
  });

  it('returns normal for BMI 18.5-24.9', () => {
    expect(getBMICategory(22)).toBe('normal');
  });

  it('returns overweight for BMI 25-29.9', () => {
    expect(getBMICategory(27)).toBe('overweight');
  });

  it('returns obese for BMI >= 30', () => {
    expect(getBMICategory(35)).toBe('obese');
  });
});

describe('getBloodPressureInterpretation', () => {
  it('returns normal for 110/70', () => {
    const result = getBloodPressureInterpretation(110, 70);
    expect(result.severity).toBe('normal');
  });

  it('returns critical for hypertensive crisis (190/130)', () => {
    const result = getBloodPressureInterpretation(190, 130);
    expect(result.severity).toBe('critical');
    expect(result.label).toBe('Hypertensive crisis');
  });

  it('returns high for stage 2 hypertension (150/95)', () => {
    const result = getBloodPressureInterpretation(150, 95);
    expect(result.severity).toBe('high');
    expect(result.label).toBe('Stage 2 hypertension');
  });

  it('returns critical for hypotension (80/50)', () => {
    const result = getBloodPressureInterpretation(80, 50);
    expect(result.severity).toBe('critical');
    expect(result.label).toBe('Hypotension');
  });

  it('handles null inputs gracefully', () => {
    const result = getBloodPressureInterpretation(null, null);
    expect(result.severity).toBe('normal');
  });
});

describe('getSpO2Interpretation', () => {
  it('returns normal for SpO2 >= 95', () => {
    expect(getSpO2Interpretation(98).severity).toBe('normal');
  });

  it('returns low for SpO2 90-94', () => {
    expect(getSpO2Interpretation(92).severity).toBe('low');
  });

  it('returns critical for SpO2 < 90', () => {
    expect(getSpO2Interpretation(85).severity).toBe('critical');
  });
});

describe('getPulseInterpretation', () => {
  it('returns normal for 72 bpm', () => {
    expect(getPulseInterpretation(72).severity).toBe('normal');
  });

  it('returns low for adult bradycardia (50 bpm)', () => {
    expect(getPulseInterpretation(50).severity).toBe('low');
  });

  it('returns critical for severe bradycardia (35 bpm)', () => {
    expect(getPulseInterpretation(35).severity).toBe('critical');
  });
});

describe('isVitalInNormalRange', () => {
  it('returns normal for systolic 115 mmHg', () => {
    const result = isVitalInNormalRange('systolic', 115);
    expect(result.isNormal).toBe(true);
    expect(result.severity).toBe('normal');
  });

  it('returns critical for systolic 200 mmHg', () => {
    const result = isVitalInNormalRange('systolic', 200);
    expect(result.isNormal).toBe(false);
    expect(result.severity).toBe('critical');
  });

  it('returns normal for SpO2 99%', () => {
    const result = isVitalInNormalRange('spo2', 99);
    expect(result.isNormal).toBe(true);
  });

  it('handles null value gracefully', () => {
    const result = isVitalInNormalRange('pulse', null);
    expect(result.isNormal).toBe(true);
    expect(result.severity).toBe('normal');
  });
});

describe('formatMedicationDose', () => {
  it('formats dose with unit and frequency', () => {
    expect(formatMedicationDose(500, 'mg', 'twice daily')).toBe('500 mg twice daily');
  });

  it('returns -- for null dose', () => {
    expect(formatMedicationDose(null, 'mg', 'once daily')).toBe('--');
  });

  it('formats dose with unit only when no frequency', () => {
    expect(formatMedicationDose(250, 'mL', '')).toBe('250 mL');
  });
});
