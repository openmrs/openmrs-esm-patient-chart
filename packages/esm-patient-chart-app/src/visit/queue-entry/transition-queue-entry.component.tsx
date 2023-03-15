import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useVisit } from '@openmrs/esm-framework';
import styles from './transition-queue-entry.scss';
import { useVisitQueueEntries } from './queue.resource';
import { Button } from '@carbon/react';

interface TransitionQueueEntryProps {
  patientUuid: string;
}

const TransitionQueueEntry: React.FC<TransitionQueueEntryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit, isValidating } = useVisit(patientUuid);
  const { queueEntry, isLoading } = useVisitQueueEntries(patientUuid, currentVisit?.uuid);

  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button kind="primary" size="sm" className={styles.transitionStatusBtn} onClick={launchEditPriorityModal}>
      {t('movePatientToNextService', 'Move patient to next service')}
    </Button>
  );
};

export default TransitionQueueEntry;
