import React from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash-es';
import { age, getPatientName, formatDate, parseDate, usePatient } from '@openmrs/esm-framework';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patient?: fhir.Patient;
  patientUuid?: string;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const { patient: fetchedPatient } = usePatient(patientUuid);

  const currentPatient = patient ?? fetchedPatient;

  if (!currentPatient) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.name}>{getPatientName(currentPatient)}</p>
      <div className={styles.details}>
        <span>{capitalize(currentPatient.gender)}</span> &middot; <span>{age(currentPatient.birthDate)}</span> &middot;{' '}
        <span>{formatDate(parseDate(currentPatient.birthDate), { mode: 'wide', time: false })}</span>
      </div>
    </div>
  );
};

export default PatientDetailsTile;
