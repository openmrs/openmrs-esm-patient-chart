import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useVisit, showModal } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface CancelVisitOverflowMenuItemProps {
  patientUuid: string;
}

const CancelVisitOverflowMenuItem: React.FC<CancelVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('cancel-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    currentVisit && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('cancelVisit', 'Cancel visit')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default CancelVisitOverflowMenuItem;
