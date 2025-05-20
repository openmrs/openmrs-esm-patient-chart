import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import styles from './action-button.scss';

interface DeleteVisitOverflowMenuItemProps {
  patientUuid: string;
}

const DeleteVisitOverflowMenuItem: React.FC<DeleteVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { activeVisit } = usePatientChartStore().visits;

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('delete-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
      visit: activeVisit,
    });
  }, [patientUuid, activeVisit]);

  return (
    activeVisit && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('deleteActiveVisit', 'Delete active visit')}
        onClick={handleLaunchModal}
        isDelete
      />
    )
  );
};

export default DeleteVisitOverflowMenuItem;
