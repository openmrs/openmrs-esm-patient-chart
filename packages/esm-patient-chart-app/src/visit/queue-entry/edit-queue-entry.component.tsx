import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import styles from './edit-queue-entry.scss';
import { MappedVisitQueueEntry } from './queue.resource';
import { Edit } from '@carbon/react/icons';
import { Button } from '@carbon/react';

interface EditQueueEntryProps {
  queueEntry: MappedVisitQueueEntry;
}

export const EditQueueEntry: React.FC<EditQueueEntryProps> = ({ queueEntry }) => {
  const { t } = useTranslation();
  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      kind="tertiary"
      className={styles.editStatusBtn}
      onClick={launchEditPriorityModal}
      iconDescription={t('editQueueEntryStatusTooltip', 'Edit')}
      hasIconOnly
      renderIcon={(props) => <Edit className={styles.editStatusIcon} size={16} {...props} />}
    />
  );
};
