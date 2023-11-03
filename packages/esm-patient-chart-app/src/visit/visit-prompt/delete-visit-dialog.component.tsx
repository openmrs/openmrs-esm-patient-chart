import React, { useState } from 'react';
import { ComposedModal, Modal, Button, ModalHeader, ModalBody, ModalFooter, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Visit, formatDatetime, showToast, useVisit, useVisitTypes } from '@openmrs/esm-framework';
import { deleteVisit } from '../visits-widget/visit.resource';
import styles from './start-visit-dialog.scss';

interface DeleteVisitDialogProps {
  closeModal: () => void;
  patientUuid: string;
  visit: Visit;
}

const DeleteVisitDialog: React.FC<DeleteVisitDialogProps> = ({ closeModal, patientUuid, visit }) => {
  const { t } = useTranslation();
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const { mutate: mutateVisits } = useVisit(patientUuid);

  const handleDeleteVisit = () => {
    setIsDeletingVisit(true);
    deleteVisit(visit?.uuid)
      .then(() => {
        mutateVisits();
        showToast({
          title: t('visitDeleted', '{{visit}} deleted', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          critical: true,
          kind: 'success',
          description: t('visitDeletedSuccessfully', '{{visit}} is deleted successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
        });
      })
      .catch(() => {
        showToast({
          title: t('errorDeletingVisit', 'Error deleting visit'),
          critical: true,
          kind: 'success',
          description: t('errorOccuredDeletingVisit', 'An error occured when deleting visit'),
        });
      })
      .finally(() => {
        setIsDeletingVisit(false);
        closeModal();
      });
  };

  if (!visit?.stopDatetime) {
    return (
      <div>
        <ModalHeader closeModal={closeModal}>
          <span className={styles.header}>{t('activeVisitCannotBeDeleted', 'Active visit cannot be deleted')}</span>
        </ModalHeader>
        <ModalBody>
          <p className={styles.body}>
            {t(
              'visitContainsEncounters',
              '{{visit}} is an active visit and cannot be deleted. You can cancel the visit from the Actions on the patient banner.',
              {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              },
            )}
          </p>
        </ModalBody>
      </div>
    );
  }

  if (visit?.encounters?.length) {
    return (
      <div>
        <ModalHeader closeModal={closeModal}>
          <span className={styles.header}>{t('visitCannotBeDeleted', 'Visit cannot be deleted')}</span>
        </ModalHeader>
        <ModalBody>
          <p className={styles.body}>
            {t(
              'visitContainsEncounters',
              '{{visit}}, starting {{visitStartDate}} and ending {{visitEndDate}}, cannot be deleted since there are encounters associated with the visit.',
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
          </p>
        </ModalBody>
      </div>
    );
  }

  return (
    <div>
      <ModalHeader closeModal={closeModal}>
        <span className={styles.header}>{t('deleteVisitDialogHeader', 'Are you sure you want to delete visit?')}</span>
      </ModalHeader>
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
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDeleteVisit}>
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
