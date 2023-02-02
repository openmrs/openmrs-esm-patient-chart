import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { deletePatientCondition, useConditions } from './conditions.resource';

interface DeleteConditionModalProps {
  closeDeleteModal: () => void;
  conditionId: string;
  patientUuid: string;
}

const DeleteConditionModal: React.FC<DeleteConditionModalProps> = ({ closeDeleteModal, conditionId, patientUuid }) => {
  const { t } = useTranslation();
  const { mutate } = useConditions(patientUuid);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    deletePatientCondition(conditionId)
      .then(({ status }) => {
        if (status === 200) {
          mutate();
          closeDeleteModal();
          showToast({
            critical: true,
            kind: 'success',
            description: t('conditionDeletedSuccessfully', 'Condition deleted successfully'),
            title: t('conditionDeleted', 'Condition Deleted'),
          });
        }
      })
      .catch((err) => {
        console.error('Error deleting condition: ', err);
        showNotification({
          title: t('errorDeletingCondition', 'Error deleting condition'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      });
  };

  return (
    <div>
      <ModalHeader closeModal={closeDeleteModal} title={t('deleteCondition', 'Delete condition')} />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this condition?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleSubmit} disabled={isSubmitting}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionModal;
