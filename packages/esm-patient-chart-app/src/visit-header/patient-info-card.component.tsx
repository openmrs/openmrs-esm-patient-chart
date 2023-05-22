import React, { useCallback } from 'react';
import { Tooltip } from '@carbon/react';
import styles from './visit-header.scss';
import { age, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const PatientInfoCard = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const getGender = useCallback(
    (gender) => {
      const genderTranslations = {
        male: t('male', 'Male'),
        female: t('female', 'Female'),
        other: t('other', 'Other'),
        unknown: t('unknown', 'Unknown'),
      };
      return genderTranslations[gender] || gender;
    },
    [t],
  );

  if (!patient) {
    return null;
  }

  const patientAgeAndGender = `${parseInt(age(patient?.birthDate))}, ${getGender(patient?.gender)}`;
  const patientName = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const truncate = !isTablet && patientName.trim().length > 25;

  const patientToolTip = (
    <>
      <p className={styles.tooltipPatientName}>{patientName}</p>
      <p className={styles.tooltipPatientInfo}>{patientAgeAndGender}</p>
    </>
  );

  if (truncate) {
    return (
      <Tooltip align="bottom-left" width={100} label={patientToolTip}>
        <button className={styles.longPatientNameBtn} type="button">
          {patientName.slice(0, 25) + '...'}
        </button>
      </Tooltip>
    );
  } else {
    return (
      <>
        <span className={styles.patientName}>{patientName}</span>{' '}
        <span className={styles.patientInfo}>
          {parseInt(age(patient.birthDate))}, {getGender(patient.gender)}
        </span>
      </>
    );
  }
};

export default PatientInfoCard;
