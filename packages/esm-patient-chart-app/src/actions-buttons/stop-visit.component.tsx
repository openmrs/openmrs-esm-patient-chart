import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { OverflowMenuItem } from '@carbon/react';
import styles from './action-button.scss';

interface StopVisitOverflowMenuItemProps {
  patientUuid: string;
}

/**
 * This button shows up in the patient banner action menu, but only when the patient has an active visit.
 * On click, it opens the modal in end-visit-dialog.component.tsx
 */
const StopVisitOverflowMenuItem: React.FC<StopVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { activeVisit } = useVisit(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    activeVisit && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={`${t('endVisit', 'End visit')}`}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default StopVisitOverflowMenuItem;
