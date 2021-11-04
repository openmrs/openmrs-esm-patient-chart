import React from 'react';
import { capitalize } from 'lodash';
import { age, useCurrentPatient } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import styles from './patient-details-tile.component.scss';

interface PatientDetailsTileInterface {
  patientUuid: string;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patientUuid }) => {
  const [, patient] = useCurrentPatient(patientUuid);

  return (
    <>
      <div className={styles.detailsColumn}>
        <p>
          {patient?.name[0].given.join(' ')} {patient?.name[0].family}
        </p>
        <div>
          <span>{capitalize(patient?.gender)}</span> &middot; <span>{age(patient?.birthDate)}</span> &middot;{' '}
          <span>{dayjs(patient?.birthDate).format('DD - MMM - YYYY')} </span>
        </div>
      </div>
      <span className={styles.divider}></span>
    </>
  );
};

export default PatientDetailsTile;
