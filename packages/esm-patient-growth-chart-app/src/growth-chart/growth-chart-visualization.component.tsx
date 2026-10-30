import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import { DataTableSkeleton } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { getAgeTickStep, getChartOptions } from './growth-chart.utils';
import { type GrowthChartData, useChartData } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [ageTickStep, setAgeTickStep] = useState<number>();

  const { data: chartData, isLoading, error } = useChartData(patient, weights);
  const chartOptions = useMemo(() => getChartOptions(t, ageTickStep), [t, ageTickStep]);

  // The container only renders once the data has loaded, so start observing it then
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAgeTickStep(getAgeTickStep(entry.contentRect.width));
      }
    });
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isLoading, error]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('growthChart', 'Growth chart')} />;
  }

  return (
    <div className={styles.chartContainer} ref={chartContainerRef}>
      {/* Remount when the step changes, since Carbon can leave the old ticks behind if their exit animation is cut short */}
      <LineChart key={ageTickStep} data={chartData} options={chartOptions} />
    </div>
  );
};

export default GrowthChartVisualization;
