import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface MarkPatientAliveOverflowMenuItemProps {
  patientUuid?: string;
  patient?: fhir.Patient;
  closeMenu?: () => void;
}

const MarkPatientAliveOverflowMenuItem: React.FC<MarkPatientAliveOverflowMenuItemProps> = ({
  patientUuid,
  patient,
  closeMenu,
}) => {
  const { t } = useTranslation();
  const isDead = patient.deceasedBoolean ?? Boolean(patient.deceasedDateTime);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('mark-patient-alive-modal', {
      closeModal: () => dispose(),
      patientUuid,
      patient,
    });
  }, [patientUuid, patient]);

  return (
    patient &&
    isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markPatientAlive', 'Mark patient alive')}
        onClick={handleLaunchModal}
        closeMenu={closeMenu}
      />
    )
  );
};

export default MarkPatientAliveOverflowMenuItem;
