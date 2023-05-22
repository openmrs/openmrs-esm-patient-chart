import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import { STATUS, PRIORITY } from '../constants';
import styles from './visit-header.scss';

const statusMessageMap = {
  [STATUS.WAITING]: (queueEntry) => `Waiting for ${queueEntry.service}`,
  [STATUS.IN_SERVICE]: (queueEntry) => `Attending ${queueEntry.service}`,
  [STATUS.FINISHED_SERVICE]: (queueEntry) => `Finished ${queueEntry.service}`,
};

const VisitQueueEntryDetails = ({ queueEntry, priority }) => {
  const { t } = useTranslation();

  const getServiceString = useCallback(() => {
    const getStatusMessage = statusMessageMap[queueEntry?.status?.toLowerCase()];
    return getStatusMessage ? getStatusMessage(queueEntry) : '';
  }, [queueEntry]);

  const getTagType = (priority) => {
    switch (priority?.toLowerCase()) {
      case PRIORITY.EMERGENCY:
        return 'red';
      case PRIORITY.NOT_URGENT:
        return 'green';
      default:
        return 'gray';
    }
  };

  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return queueEntry ? (
    <>
      <div className={styles.navDivider} />
      <span className={styles.patientInfo}>
        {getServiceString()}
        <Tag
          className={priority === 'Priority' ? styles.priorityTag : styles.tag}
          type={getTagType(priority?.toLowerCase())}
        >
          {priority}
        </Tag>
        <Button
          iconDescription={t('moveToNextService', 'Move to next service')}
          size="sm"
          className={styles.editQueue}
          hasIconOnly
          renderIcon={Edit}
          tooltipAlignment="start"
          tooltipPosition="bottom"
          onClick={launchEditPriorityModal}
        />
      </span>
      <div className={styles.navDivider} />
    </>
  ) : null;
};

export default VisitQueueEntryDetails;
