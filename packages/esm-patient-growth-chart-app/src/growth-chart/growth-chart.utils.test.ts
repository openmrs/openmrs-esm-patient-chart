import dayjs from 'dayjs';
import { getReferenceSeries, getChartOptions } from './growth-chart.utils';
import { getPatientSeries } from './growth-chart-visualization.component';
import type { Observation } from './growth-chart.resource';
import type { TFunction } from 'i18next';

describe('growth-chart.utils', () => {
  describe('getReferenceSeries', () => {
    it('should return reference series for male', () => {
      const result = getReferenceSeries('male');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('group');
      expect(result[0]).toHaveProperty('age');
      expect(result[0]).toHaveProperty('value');
    });

    it('should return reference series for female', () => {
      const result = getReferenceSeries('female');
      expect(result.length).toBeGreaterThan(0);
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
  });
});
