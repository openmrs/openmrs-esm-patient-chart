import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import styles from './queue-entry-label.scss';
import capitalize from 'lodash-es/capitalize';
import { showModal } from '@openmrs/esm-framework';
import { MappedVisitQueueEntry } from '../../visit/queue-entry/queue.resource';
import NavDivider from '../nav-link.component';

interface QueueEntryLabelProps {
  queueEntry: MappedVisitQueueEntry;
}

export const QueueEntryLabel: React.FC<QueueEntryLabelProps> = ({ queueEntry }) => {
  const queueEntryLabel = `${queueEntry?.status ?? ''}  ${queueEntry?.service ?? ''}`;
  const handleOpenEditQueueModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  if (!queueEntry) {
    return null;
  }

  return (
    <div className={styles.container}>
      <NavDivider />
      <div className={styles.queueEntryContainer}>
        <span>{capitalize(queueEntryLabel)}</span>
        <Button hasIconOnly renderIcon={Edit} onClick={handleOpenEditQueueModal} iconDescription="Add" />
      </div>
    </div>
  );
};

export default QueueEntryLabel;
