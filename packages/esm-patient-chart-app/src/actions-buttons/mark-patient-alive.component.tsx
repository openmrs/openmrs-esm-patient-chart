import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { usePatientDeceased } from '../deceased/deceased.resource';
import styles from './action-button.scss';

interface MarkPatientAliveOverflowMenuItemProps {
  patientUuid?: string;
}

const MarkPatientAliveOverflowMenuItem: React.FC<MarkPatientAliveOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isDead, isLoading: isPatientLoading } = usePatientDeceased(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('confirm-alive-modal', {
      patientUuid,
      closeModal: () => dispose(),
    });
  }, [patientUuid]);

  return (
    !isPatientLoading &&
    isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markAlive', 'Mark alive')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default MarkPatientAliveOverflowMenuItem;
