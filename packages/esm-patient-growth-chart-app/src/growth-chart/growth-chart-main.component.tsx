import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import styles from './growth-chart-main.scss';
import GrowthChart from './growth-chart.component';

interface PatientGrowthChartAppProps {
  patientUuid: string;
}

const PatientGrowthChartApp: React.FC<PatientGrowthChartAppProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <GrowthChart patientUuid={patientUuid} />
    </div>
  );
};

export default PatientGrowthChartApp;
