import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import styles from './patient-growth-chart-app.scss';

const PatientGrowthChartApp: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Layer>
        <Tile className={styles.tile}>
          <h1 className={styles.heading}>{t('growthChartUnderConstruction', 'Growth chart is under construction')}</h1>
        </Tile>
      </Layer>
    </div>
  );
};

export default PatientGrowthChartApp;
