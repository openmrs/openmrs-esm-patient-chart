import dayjs from 'dayjs';
import boysWeightData from '../who-data/boys/weight-for-age.json';
import girlsWeightData from '../who-data/girls/weight-for-age.json';
import type { Observation } from './growth-chart.resource';

export const getReferenceSeries = (gender: string) => {
  const whoData = gender.toLowerCase() === 'female' ? girlsWeightData : boysWeightData;
  const referenceSeries = [];
  const percentiles = ['P3', 'P15', 'P50', 'P85', 'P97'];

  whoData.forEach((point) => {
    percentiles.forEach((p) => {
      referenceSeries.push({
        group: p,
        age: point.age_months,
        value: point[p],
      });
    });
  });

  return referenceSeries;
};

export const getPatientSeries = (weights: Observation[], birthDate: dayjs.Dayjs, patientWeightLabel: string) => {
  return weights
    .map((obs) => {
      const obsDate = dayjs(obs.effectiveDateTime);
      if (!obsDate.isValid()) return null;

      const ageInMonths = obsDate.diff(birthDate, 'month', true);
      if (ageInMonths < 0) return null;

      return {
        group: patientWeightLabel,
        age: ageInMonths,
        value: obs.value,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.age - b!.age);
};
