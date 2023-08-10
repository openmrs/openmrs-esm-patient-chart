import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { useBiometrics } from './biometrics.resource';
import { ConfigObject } from '../config-schema';
import styles from './weight-tile.scss';

interface WeightTileInterface {
  patientUuid: string;
}

const WeightTile: React.FC<WeightTileInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const { biometrics } = useBiometrics(patientUuid, config.concepts);
  const weightData = biometrics?.filter((result) => result.weight);

  if (biometrics?.length > 0) {
    return (
      <span className={styles.weight}>
        <span className={styles.value}>{weightData?.[0]?.weight}</span>{' '}
        {conceptUnits.get(config.concepts.weightUuid) ?? ''}
      </span>
    );
  }

  return <>--</>;
};

export default WeightTile;
