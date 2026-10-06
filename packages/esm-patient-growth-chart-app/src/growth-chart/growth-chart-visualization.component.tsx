import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import { DataTableSkeleton } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { getChartOptions } from './growth-chart.utils';
import { type GrowthChartData, useChartData } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const { data: chartData, isLoading, error } = useChartData(patient, weights);
  const chartOptions = useMemo(() => getChartOptions(t), [t]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('growthChart', 'Growth chart')} />;
  }

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
};

export default GrowthChartVisualization;
