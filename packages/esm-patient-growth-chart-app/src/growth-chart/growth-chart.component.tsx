import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGrowthChartData } from './growth-chart.resource';
import { DataTableSkeleton, Tile } from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './growth-chart-main.scss';
import GrowthChartVisualization from './growth-chart-visualization.component';

interface GrowthChartProps {
  patientUuid: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGrowthChartData(patientUuid);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.patient) {
    return <Tile>{t('errorLoadingData', 'Error loading growth chart data')}</Tile>;
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('growthChart', 'Growth Chart')}>
        <></>
      </CardHeader>
      <div style={{ marginTop: '1rem' }}>
        <GrowthChartVisualization data={data} />
      </div>
    </div>
  );
};

export default GrowthChart;
