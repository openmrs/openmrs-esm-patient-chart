import React from 'react';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Visit, formatDatetime } from '@openmrs/esm-framework';
import { useDeleteVisit } from '../hooks/useDeleteVisit';
import styles from './start-visit-dialog.scss';

interface DeleteVisitDialogProps {
  closeModal: () => void;
  patientUuid: string;
  visit: Visit;
}

const DeleteVisitDialog: React.FC<DeleteVisitDialogProps> = ({ closeModal, patientUuid, visit }) => {
  const { t } = useTranslation();
  const { isDeletingVisit, initiateDeletingVisit } = useDeleteVisit(patientUuid, visit, closeModal);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('visit', 'Visit')}
        title={t('deleteVisitDialogHeader', 'Are you sure you want to delete this visit?')}
      />
      <ModalBody>
        <p className={styles.body}>
          {t(
            'confirmDeletingVisitTextWithStartAndEndDate',
            'Are you sure you want to delete {{visit}} which started {{visitStartDate}} and ended {{visitEndDate}}?',
            {
              visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              visitStartDate: formatDatetime(new Date(visit?.startDatetime), {
                mode: 'standard',
              }),
              visitEndDate: formatDatetime(new Date(visit?.stopDatetime), {
                mode: 'standard',
              }),
            },
          )}
          <br />
          {t('deletingVisitWillDeleteEncounters', 'Deleting this visit will delete all associated encounters.')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={initiateDeletingVisit} disabled={isDeletingVisit}>
          {!isDeletingVisit ? (
            t('deleteVisit', 'Delete visit')
          ) : (
            <InlineLoading description={t('deletingVisit', 'Deleting visit')} />
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteVisitDialog;
