import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { OpenmrsFetchError, showSnackbar } from '@openmrs/esm-framework';
import { deleteCondition, getConditionErrorReason, useConditions } from './conditions.resource';
import styles from './delete-condition.scss';

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
    if (!patientUuid) {
      console.error('DeleteConditionModal opened without patientUuid');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCondition(conditionId);
      void mutate();
      closeDeleteModal();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('conditionDeleted', 'Condition deleted'),
      });
    } catch (error) {
      console.error('Error deleting condition: ', error);
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingCondition', 'Error deleting condition'),
        // The subtitle is, in order of preference:
        // 1. For an OpenmrsFetchError (the server responded with an error), the reason the server gave in the response body
        // 2. For any other error (no response, e.g. a network failure, or a bug in this code), the error's own message
        // 3. When neither gives any text, a translated fallback
        subtitle:
          (error instanceof OpenmrsFetchError ? getConditionErrorReason(error.responseBody) : error?.message) ||
          t(
            'conditionDeleteErrorDescription',
            'The condition could not be deleted. Please try again, or contact your system administrator if the problem continues.',
          ),
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeDeleteModal, conditionId, mutate, patientUuid, t]);

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
        <Button className={styles.deleteButton} kind="danger" onClick={handleDelete} disabled={isDeleting}>
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
