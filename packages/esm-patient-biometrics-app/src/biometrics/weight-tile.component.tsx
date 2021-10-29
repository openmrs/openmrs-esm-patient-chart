import React from 'react';
import { useBiometrics } from './biometrics.resource';
import { useTranslation } from 'react-i18next';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import styles from './weight-tile.component.scss';

interface WeightTileInterface {
  patientUuid: string;
}

const WeightTile: React.FC<WeightTileInterface> = ({ patientUuid }) => {
  const { data: biometrics } = useBiometrics(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const { t } = useTranslation();

  return (
    <div className={styles.gridColumn}>
      <p>{t('weight', 'Weight')}</p>
      <span>
        {biometrics?.[0].weight} {biometrics?.[0].weight && conceptUnits?.conceptUnits[4]}
      </span>
    </div>
  );
};

export default WeightTile;
