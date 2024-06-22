import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { usePatientDeceasedStatus } from '../data.resource';
import styles from './action-button.scss';

interface MarkPatientAliveOverflowMenuItemProps {
  patientUuid?: string;
}

const MarkPatientAliveOverflowMenuItem: React.FC<MarkPatientAliveOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isDead, isLoading: isLoadingPatient } = usePatientDeceasedStatus(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('mark-patient-alive-modal', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    !isLoadingPatient &&
    isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markPatientAlive', 'Mark patient alive')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default MarkPatientAliveOverflowMenuItem;
