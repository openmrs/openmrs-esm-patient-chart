import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Tile } from '@carbon/react';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useGrowthChartData, usePatient } from './growth-chart.resource';
import GrowthChartVisualization from './growth-chart-visualization.component';
import styles from './growth-chart-main.scss';

interface GrowthChartProps {
  patientUuid: string;
  patient?: fhir.Patient;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patientUuid, patient: patientProp }) => {
  const { t } = useTranslation();
  const { patient: fetchedPatient } = usePatient(patientProp ? null : patientUuid);
  const patient = patientProp || fetchedPatient;
  const { data, isLoading, isError } = useGrowthChartData(patient);

  const ageInMonths = useMemo(() => {
    const birthDate = dayjs(patient?.birthDate);
    return birthDate.isValid() ? dayjs().diff(birthDate, 'month', true) : null;
  }, [patient?.birthDate]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.patient) {
    return <Tile>{t('errorLoadingData', 'Error loading growth chart data')}</Tile>;
  }

  if (ageInMonths !== null && ageInMonths > 60) {
    return (
      <EmptyState
        headerTitle={t('growthChartUnavailable', 'Growth Chart Unavailable')}
        displayText={t('growthCharts', 'growth charts')}
      />
    );
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('growthChart', 'Growth Chart')} />
      <div className={styles.visualizationContainer}>
        <GrowthChartVisualization data={data} />
      </div>
    </div>
  );
};

export default GrowthChart;
