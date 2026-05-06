import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import styles from './patient-procedures-app.scss';

const PatientProceduresApp: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Layer>
        <Tile className={styles.tile}>
          <h1 className={styles.heading}>
            {t('patient-procedures-appHeading', 'PatientProceduresApp')}
          </h1>
          <p className={styles.content}>
            {t('patient-procedures-appDescription', 'Welcome to the PatientProceduresApp page.')}
          </p>
        </Tile>
      </Layer>
    </div>
  );
};

export default PatientProceduresApp;