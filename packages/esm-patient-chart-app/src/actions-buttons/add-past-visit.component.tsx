import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface AddPastVisitOverflowMenuItemProps {
  patientUuid?: string;
  launchPatientChart?: boolean;
}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = ({
  patientUuid,
  launchPatientChart,
}) => {
  const { t } = useTranslation();

  const handleLaunchModal = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      closeModal: () => dispose(),
      launchPatientChart,
      patientUuid,
    });
  }, [patientUuid, launchPatientChart]);

  return (
    <OverflowMenuItem
      className={styles.menuitem}
      itemText={t('addPastVisit', 'Add past visit')}
      onClick={handleLaunchModal}
    />
  );
};

export default AddPastVisitOverflowMenuItem;
