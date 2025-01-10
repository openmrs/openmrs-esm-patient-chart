import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading } from '@carbon/react';
import { type Visit } from '@openmrs/esm-framework';
import { useDeleteVisit } from '../hooks/useDeleteVisit.hook';
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
        label={t('deletePastVisit', 'Delete past visit')}
        title={t('deletePastVisitDialogHeader', 'Are you sure you want to delete this past visit?')}
      />
      <ModalBody>
        <p className={styles.body}>
          {t(
            'confirmDeletePastVisitText',
            'Clicking confirm will delete this {{visit}} and all of its associated encounters.',
            {
              visit: visit?.visitType?.display ?? t('visit', 'Visit'),
            },
          )}
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
