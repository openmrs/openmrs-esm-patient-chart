import React from 'react';
import { capitalize } from 'lodash-es';
import { age, getPatientName, formatPartialDate, PatientPhoto } from '@openmrs/esm-framework';
import { usePatientIdentifier } from '@openmrs/esm-patient-common-lib';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patient?: fhir.Patient;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patient }) => {
  const identifier = usePatientIdentifier(patient);

  // Render nothing until the patient is loaded.
  if (!patient) {
    return null;
  }

  const patientName = getPatientName(patient);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PatientPhoto patientUuid={patient.id} patientName={patientName} />
        <div>
          <p className={styles.name}>{patientName}</p>
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
                <span>{formatPartialDate(patient.birthDate, { mode: 'wide', time: false })}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsTile;
