import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import styles from './procedures-app.scss';

const ProceduresApp: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Layer>
        <Tile className={styles.tile}>
          <h1 className={styles.heading}>
            {t('procedures-appHeading', 'ProceduresApp')}
          </h1>
          <p className={styles.content}>
            {t('procedures-appDescription', 'Welcome to the ProceduresApp page.')}
          </p>
        </Tile>
      </Layer>
    </div>
  );
};

export default ProceduresApp;