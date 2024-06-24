import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { OverflowMenuItem } from '@carbon/react';
import styles from './action-button.scss';

interface StopVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StopVisitOverflowMenuItem: React.FC<StopVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    currentVisit && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={`${t('endVisit', 'End visit')}`}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default StopVisitOverflowMenuItem;
