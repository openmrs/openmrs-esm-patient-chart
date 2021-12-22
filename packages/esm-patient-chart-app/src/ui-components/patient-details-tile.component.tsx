import React from 'react';
import { capitalize } from 'lodash';
import { age, formatDate, parseDate, useCurrentPatient } from '@openmrs/esm-framework';
import styles from './patient-details-tile.component.scss';

interface PatientDetailsTileInterface {
  patientUuid: string;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patientUuid }) => {
  const [, patient] = useCurrentPatient(patientUuid);

  return (
    <div className={styles.container}>
      <p className={styles.name}>
        {patient?.name[0].given.join(' ')} {patient?.name[0].family}
      </p>
      <div className={styles.details}>
        <span>{capitalize(patient?.gender)}</span> &middot; <span>{age(patient?.birthDate)}</span> &middot;{' '}
        <span>{formatDate(parseDate(patient?.birthDate), 'wide')} </span>
      </div>
    </div>
  );
};

export default PatientDetailsTile;
