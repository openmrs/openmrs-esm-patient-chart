import React from 'react';
import { useBiometrics } from './biometrics.resource';
import { useTranslation } from 'react-i18next';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import styles from './weight-tile.component.scss';

interface WeightTileInterface {
  patientUuid: string;
}

const WeightTile: React.FC<WeightTileInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: biometrics } = useBiometrics(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const weightData = biometrics?.filter((result) => result.weight);

  return (
    <div>
      <p className={styles.label}>{t('weight', 'Weight')}</p>
      <p className={styles.content}>
        {weightData?.length ? (
          <>
            <span className={styles.value}>{weightData?.[0]?.weight}</span> {conceptUnits?.conceptUnits?.[4]}
          </>
        ) : (
          '--'
        )}
      </p>
    </div>
  );
};

export default WeightTile;
