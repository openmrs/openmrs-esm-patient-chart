import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { cancelAppointment, useAppointments } from './appointments.resource';

interface CancelAppointmentModalProps {
  closeCancelModal: () => void;
  appointmentUuid: string;
  patientUuid: string;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  closeCancelModal,
  appointmentUuid,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { mutate } = useAppointments(patientUuid, new Date().toUTCString(), new AbortController());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    const abortController = new AbortController();
    setIsSubmitting(true);

    cancelAppointment('Cancelled', appointmentUuid, abortController)
      .then(({ status }) => {
        if (status === 200) {
          mutate();
          closeCancelModal();
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentCancelledSuccessfully', 'Appointment cancelled successfully'),
            title: t('appointmentCancelled', 'Appointment cancelled'),
          });
        }
      })
      .catch((err) => {
        showNotification({
          title: t('appointmentCancelError', 'Error cancelling appointment'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      });
  };

  return (
    <div>
      <ModalHeader closeModal={closeCancelModal} title={t('cancelAppointment', 'Cancel appointment')} />
      <ModalBody>
        <p>{t('cancelAppointmentModalConfirmationText', 'Are you sure you want to cancel this appointment?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeCancelModal}>
          {t('no', 'No')}
        </Button>
        <Button kind="danger" onClick={handleCancel} disabled={isSubmitting}>
          {t('cancel', 'Cancel')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default CancelAppointmentModal;
