import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import { getChartData, getChartOptions } from './growth-chart.utils';
import type { GrowthChartData } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const chartData = useMemo(() => getChartData(patient, weights, t), [patient, weights, t]);
  const chartOptions = useMemo(() => getChartOptions(t), [t]);

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
};

export default GrowthChartVisualization;
