import React, { useCallback } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useVisit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './cancel-visit-dialog.scss';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import { useDeleteVisit } from '../hooks/useDeleteVisit.hook';

interface CancelVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

const CancelVisitDialog: React.FC<CancelVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const visitQueryEntry = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const onDeleteVisit = useCallback(() => {
    const queueEntry = visitQueryEntry?.queueEntry;
    if (queueEntry) {
      removeQueuedPatient(queueEntry.queueUuid, queueEntry.queueEntryUuid, new AbortController());
    }
    closeModal();
  }, []);

  const { initiateDeletingVisit, isDeletingVisit } = useDeleteVisit(patientUuid, currentVisit, onDeleteVisit);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('visit', 'Visit')}
        title={t('cancelActiveVisit', 'Cancel active visit')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t('cancelVisitWarningMessage', 'Cancelling this visit will delete all associated encounters')}.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isDeletingVisit} kind="danger" onClick={initiateDeletingVisit}>
          {isDeletingVisit ? (
            <InlineLoading description={t('cancellingVisit', 'Cancelling visit')} />
          ) : (
            t('cancelVisit', 'Cancel visit')
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default CancelVisitDialog;
