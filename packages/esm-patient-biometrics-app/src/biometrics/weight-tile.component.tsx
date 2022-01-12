import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from 'carbon-components-react';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { useBiometrics } from './biometrics.resource';
import styles from './weight-tile.component.scss';
import { ConfigObject } from '../config-schema';
import { useConfig } from '@openmrs/esm-framework';

interface WeightTileInterface {
  patientUuid: string;
}

const WeightTile: React.FC<WeightTileInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const { data: biometrics, isLoading } = useBiometrics(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const weightData = biometrics?.filter((result) => result.weight);

  if (isLoading) {
    return <InlineLoading role="progressbar" description={`${t('loading', 'Loading')} ...`} />;
  }
  if (biometrics?.length) {
    return (
      <div>
        <p className={styles.label}>{t('weight', 'Weight')}</p>
        <p className={styles.content}>
          <span className={styles.value}>{weightData?.[0]?.weight}</span>{' '}
          {conceptUnits.get(config.concepts.weightUuid) ?? ''}
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className={styles.label}>{t('weight', 'Weight')}</p>
      <p className={styles.content}>--</p>
    </div>
  );
};

export default WeightTile;
