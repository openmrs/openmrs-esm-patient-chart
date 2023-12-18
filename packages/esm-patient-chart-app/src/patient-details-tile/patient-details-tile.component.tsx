import React from 'react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import { InlineLoading } from '@carbon/react';
import { age, formatDate, usePatient, parseDate } from '@openmrs/esm-framework';
import styles from './patient-details-tile.scss';

interface PatientDetailsTileInterface {
  patientUuid: string;
}

const PatientDetailsTile: React.FC<PatientDetailsTileInterface> = ({ patientUuid }) => {
  const { patient, isLoading } = usePatient(patientUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <InlineLoading role="progressbar" description={`${t('loading', 'Loading')} ...`} />;
  }

  return (
    <div className={styles.container}>
      <p className={styles.name}>
        {patient?.name[0].given.join(' ')} {patient?.name[0].family}
      </p>
      <div className={styles.details}>
        <span>{capitalize(patient?.gender)}</span> &middot; <span>{age(patient?.birthDate)}</span> &middot;{' '}
        <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
      </div>
    </div>
  );
};

export default PatientDetailsTile;
