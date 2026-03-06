import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { LineChart } from '@carbon/charts-react';
import { getReferenceSeries, getChartOptions } from './growth-chart.utils';
import type { GrowthChartData, Observation } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const birthDate = React.useMemo(() => dayjs(patient?.birthDate), [patient?.birthDate]);

  const chartData = React.useMemo(() => {
    if (!patient || !weights || !birthDate.isValid()) {
      return [];
    }
    return getChartData(patient, weights, t);
  }, [patient, weights, t, birthDate]);

  const chartOptions = React.useMemo(() => getChartOptions(t), [t]);

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
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

const getChartData = (patient: fhir.Patient, weights: Observation[], t: TFunction) => {
  const birthDate = dayjs(patient.birthDate);
  if (!birthDate.isValid()) {
    console.warn('Invalid birth date for patient');
    return [];
  }

  const referenceSeries = getReferenceSeries(patient.gender);
  const patientSeries = getPatientSeries(weights, birthDate, t('patientWeight', 'Patient Weight'));

  return [...referenceSeries, ...patientSeries];
};

export default GrowthChartVisualization;
