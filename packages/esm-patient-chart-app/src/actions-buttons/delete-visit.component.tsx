import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useVisit, showModal } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface DeleteVisitOverflowMenuItemProps {
  patientUuid: string;
  closeMenu?: () => void;
}

/**
 * This button shows up in the patient banner action menu, but only when the patient has an active visit.
 * On click, it opens the modal in delete-visit-dialog.component.tsx to DELETE the visit
 */
const DeleteVisitOverflowMenuItem: React.FC<DeleteVisitOverflowMenuItemProps> = ({ patientUuid, closeMenu }) => {
  const { t } = useTranslation();
  const { activeVisit, mutate: mutateActiveVisit } = useVisit(patientUuid);

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('delete-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
      activeVisit,
      mutateActiveVisit,
    });
  }, [patientUuid, activeVisit, mutateActiveVisit]);

  return (
    activeVisit && (
      <OverflowMenuItem
        className={styles.menuitem}
        closeMenu={closeMenu}
        hasDivider
        isDelete
        itemText={t('deleteActiveVisit', 'Delete active visit')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default DeleteVisitOverflowMenuItem;
