import React, { useMemo } from 'react';
import { InlineLoading } from '@carbon/react';
import capitalize from 'lodash-es/capitalize';
import { Extension, ExtensionSlot, age, formatDate, usePatient } from '@openmrs/esm-framework';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patientUuid: string;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patientUuid }) => {
  const { patient, isLoading } = usePatient(patientUuid);

  const state = useMemo(() => ({ patientUuid }), [patientUuid]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading className={styles.loading} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.name}>
        {patient?.name[0].given.join(' ')} {patient?.name[0].family}
      </span>
      <span>{capitalize(patient?.gender)}</span> &middot; <span>{age(patient?.birthDate)}</span> &middot;{' '}
      <span>{formatDate(new Date(patient?.birthDate), { mode: 'wide', time: false })}</span> &middot;{''}
      <span>
        <ExtensionSlot name="weight-tile-slot" state={state} />
      </span>
      <ExtensionSlot name="allergy-tile-slot" state={state} />
    </div>
  );
};

export default PatientDetailsTile;
