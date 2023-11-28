import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import styles from './edit-queue-entry.scss';
import { type MappedVisitQueueEntry } from './queue.resource';
import { Edit } from '@carbon/react/icons';
import { Button } from '@carbon/react';

interface EditQueueEntryProps {
  queueEntry: MappedVisitQueueEntry;
}

export const EditQueueEntry: React.FC<EditQueueEntryProps> = ({ queueEntry }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      className={styles.editStatusBtn}
      onClick={launchEditPriorityModal}
      size={isTablet ? 'sm' : 'md'}
      iconDescription={t('movePatientToNextService', 'Move patient to next service')}
      renderIcon={(props) => <Edit className={styles.editStatusIcon} size={16} {...props} />}
    >
      {isTablet ? t('movePatient', 'Move patient') : t('movePatientToNextService', 'Move patient to next service')}
    </Button>
  );
};
