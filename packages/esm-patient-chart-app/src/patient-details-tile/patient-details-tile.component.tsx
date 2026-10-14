import React from 'react';
import { capitalize } from 'lodash-es';
import { age, getPatientName, formatDate, parseDate } from '@openmrs/esm-framework';
import { usePatientIdentifier } from '@openmrs/esm-patient-common-lib';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patient?: fhir.Patient;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patient }) => {
  const identifier = usePatientIdentifier(patient);

  // Render nothing until the patient is loaded. Without this guard the tile
  // shows an empty name and " · · Today" because formatting an undefined date
  // falls back to today's date.
  if (!patient) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.name}>{getPatientName(patient)}</p>
      <div className={styles.details}>
        {identifier && (
          <>
            <span>{identifier}</span> &middot;{' '}
          </>
        )}
        <span>{capitalize(patient.gender)}</span>
        {patient.birthDate && (
          <>
            {' '}
            &middot; <span>{age(patient.birthDate)}</span> &middot;{' '}
            <span>{formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsTile;
