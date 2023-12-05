import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { deleteCondition, useConditions } from './conditions.resource';

interface DeleteConditionModalProps {
  closeDeleteModal: () => void;
  conditionId: string;
  patientUuid?: string;
}

const DeleteConditionModal: React.FC<DeleteConditionModalProps> = ({ closeDeleteModal, conditionId, patientUuid }) => {
  const { t } = useTranslation();
  const { mutate } = useConditions(patientUuid);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const res = await deleteCondition(conditionId);

      if (res.status === 200) {
        mutate();
        closeDeleteModal();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('conditionDeleted', 'Condition deleted'),
        });
      }
    } catch (error) {
      console.error('Error deleting condition: ', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingCondition', 'Error deleting condition'),
        subtitle: error?.message,
      });
    }
  }, [closeDeleteModal, conditionId, mutate, t]);

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
        <Button kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionModal;
