import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, ModalBody, ModalFooter, ModalHeader, TimePicker } from '@carbon/react';
import { showNotification, showToast, fhirBaseUrl } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { Condition, deletePatientCondition } from './conditions.resource';

import styles from './index.scss';

interface deleteConditionDialogProps {
  closeDeleteModal: () => void;
  conditionId: string;
  patientUuid: string;
}

const CheckInAppointmentModal: React.FC<deleteConditionDialogProps> = ({
  closeDeleteModal,
  conditionId,
  patientUuid,
}) => {
  const { t } = useTranslation();

  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { status } = await deletePatientCondition(conditionId);
    if (status === 200) {
      closeDeleteModal();
      showToast({
        critical: true,
        kind: 'success',
        description: t('conditionDeleteSuccessful', 'Condition has been deleted successfully'),
        title: t('conditionDeleted', 'Condition Deleted'),
      });
      mutate(`${fhirBaseUrl}/Condition?patient=${patientUuid}`);
    } else {
      showNotification({
        title: t('conditionDeleteError', 'Error deleting a condition'),
        kind: 'error',
        critical: true,
        description: t('errorDeleting', 'Error deleting a condition'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeDeleteModal}
        title={t('deleteConditionTitle', 'Are you sure you want to delete this condition?')}
      />
      <ModalBody>
        <p>{t('deleteConfirmationText', 'You can change conditions to "Inactive" using Edit mode.')}</p>
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

export default CheckInAppointmentModal;
