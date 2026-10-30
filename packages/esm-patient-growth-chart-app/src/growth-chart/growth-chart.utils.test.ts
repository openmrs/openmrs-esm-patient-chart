import dayjs from 'dayjs';
import { getAgeTickStep, getChartOptions, getPatientSeries } from './growth-chart.utils';
import { getReferenceSeries, type Observation } from './growth-chart.resource';
import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

describe('growth-chart.utils', () => {
  describe('getReferenceSeries', () => {
    it('should return reference series for male', async () => {
      const result = await getReferenceSeries('male');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('group');
      expect(result[0]).toHaveProperty('age');
      expect(result[0]).toHaveProperty('value');
    });

    it('should return reference series for female', async () => {
      const result = await getReferenceSeries('female');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return an empty series for unsupported genders', async () => {
      expect(await getReferenceSeries('unknown')).toEqual([]);
    });
  });

  describe('getPatientSeries', () => {
    const birthDate = dayjs('2023-01-01');
    const patientWeightLabel = 'Patient Weight';

    it('should transform observations to patient series', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2023-02-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = getPatientSeries(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('Patient Weight');
      expect(result[0].value).toBe(10);
      expect(result[0].age).toBeCloseTo(1, 0); // 1 month
    });

    it('should filter out observations before birth date', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2022-12-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = getPatientSeries(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(0);
    });

    it('should filter out observations without a date or value', () => {
      const weights: Observation[] = [{ id: '1' }];

      const result = getPatientSeries(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(0);
    });

    it('should sort observations by age', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2023-03-01',
          value: 12,
          unit: 'kg',
          code: 'weight',
        },
        {
          id: '2',
          effectiveDateTime: '2023-02-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = getPatientSeries(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(12);
    });
  });

  describe('getChartOptions', () => {
    it('should return chart options object', () => {
      const t = (key: string, defaultValue: string) => defaultValue;
      const options = getChartOptions(t as unknown as TFunction);
      expect(options).toHaveProperty('title');
      expect(options).toHaveProperty('axes');
      expect(options).toHaveProperty('toolbar');
    });

    it('labels every second month by default', () => {
      const t = (key: string, defaultValue: string) => defaultValue;
      const ticks = getChartOptions(t as unknown as TFunction).axes?.bottom?.ticks?.values;
      expect(ticks).toHaveLength(31);
      expect(ticks?.[ticks.length - 1]).toBe(60);
    });

    it('labels the age axis at the given step', () => {
      const t = (key: string, defaultValue: string) => defaultValue;
      const options = getChartOptions(t as unknown as TFunction, 12);
      expect(options.axes?.bottom?.ticks?.values).toEqual([0, 12, 24, 36, 48, 60]);
    });
  });

  describe('getAgeTickStep', () => {
    it('keeps a label every second month when there is room for them', () => {
      expect(getAgeTickStep(1200)).toBe(2);
      expect(getAgeTickStep(900)).toBe(2);
    });

    it('labels fewer months as the chart gets narrower', () => {
      expect(getAgeTickStep(600)).toBe(4);
      expect(getAgeTickStep(300)).toBe(6);
      expect(getAgeTickStep(200)).toBe(12);
    });

    it('still labels each year on a very narrow chart', () => {
      expect(getAgeTickStep(100)).toBe(12);
    });
  });
});
