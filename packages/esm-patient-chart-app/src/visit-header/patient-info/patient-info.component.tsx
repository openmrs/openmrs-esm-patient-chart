import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@carbon/react';
import { useLayoutType, age } from '@openmrs/esm-framework';
import styles from './patient-info.scss';
import NavDivider from '../nav-link.component';

interface PatientInfoProps {
  patient: fhir.Patient;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Render translated gender
  const getGender = useCallback(
    (gender) => {
      switch (gender) {
        case 'male':
          return t('male', 'Male');
        case 'female':
          return t('female', 'Female');
        case 'other':
          return t('other', 'Other');
        case 'unknown':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    },
    [t],
  );

  const name = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientNameIsTooLong = !isTablet && name.trim().length > 25;

  function truncateName(name, maxLength = 25) {
    if (name.length <= maxLength) {
      return name;
    } else {
      return name.slice(0, maxLength) + '...';
    }
  }

  const tooltipContent = (
    <>
      <p className={styles.tooltipPatientName}>{name}</p>
      <p className={styles.tooltipPatientInfo}>{`${parseInt(age(patient?.birthDate))}, ${getGender(
        patient?.gender,
      )}`}</p>
    </>
  );

  if (patientNameIsTooLong) {
    return (
      <div className={styles.container}>
        <NavDivider />
        <Tooltip className={styles.toolTipContainer} label={tooltipContent} align="bottom-left">
          <button type="button">{truncateName(name)}</button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavDivider />
      <div className={styles.patientInfoContainer}>
        <span className={styles.patientName}>{name}</span>
        <span className={styles.patientInfo}>
          {`${parseInt(age(patient?.birthDate))}, ${getGender(patient?.gender)}`}
        </span>
      </div>
    </div>
  );
};

export default PatientInfo;
