import React from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash-es';
import { age, getPatientName, formatDate, parseDate } from '@openmrs/esm-framework';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patient?: fhir.Patient;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patient }) => {
  const { t } = useTranslation();

  const genderContext = patient?.gender ? patient.gender.toLowerCase() : undefined;
  const patientTitle = genderContext
    ? t('patient', { context: genderContext, defaultValue: 'Patient' })
    : t('patient', 'Patient');

  return (
    <div className={styles.container}>
      <p className={styles.name}>{patient ? getPatientName(patient) : ''}</p>
      <div className={styles.details}>
        <span>{patientTitle}</span> &middot; <span>{capitalize(patient?.gender)}</span> &middot; <span>{age(patient?.birthDate)}</span> &middot;{' '}
        <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
      </div>
    </div>
  );
};

export default PatientDetailsTile;
