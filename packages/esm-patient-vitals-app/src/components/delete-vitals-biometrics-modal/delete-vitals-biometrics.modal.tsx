import React, { useState, useCallback, useMemo } from 'react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { deleteEncounter, invalidateCachedVitalsAndBiometrics } from '../../common';
import { ModalHeader, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';

interface DeleteVitalsAndBiometricsModalProps {
  patientUuid: string;
  encounterUuid: string;
  formType: 'vitals' | 'biometrics';
  closeDeleteModal: () => void;
}

const DeleteVitalsAndBiometricsModal: React.FC<DeleteVitalsAndBiometricsModalProps> = ({
  encounterUuid,
  formType,
  closeDeleteModal,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const messages = useMemo(
    () => ({
      success: {
        vitals: t('vitalsDeleted', 'Vitals deleted'),
        biometrics: t('biometricsDeleted', 'Biometrics deleted'),
      },
      error: {
        vitals: t('errorDeletingVitals', 'Error deleting vitals'),
        biometrics: t('errorDeletingBiometrics', 'Error deleting biometrics'),
      },
      modalTitle: {
        vitals: t('deletePatientVitals', 'Delete Vitals'),
        biometrics: t('deletePatientBiometrics', 'Delete Biometrics'),
      },
      modalDescription: {
        vitals: t(
          'deleteVitalsConfirmationText',
          'Note: Deleting vitals will also delete any associated biometrics. Are you sure you want to delete these entries?',
        ),
        biometrics: t(
          'deleteBiometricsConfirmationText',
          'Note: Deleting biometrics will not delete any associated vitals. Are you sure you want to delete these entries?',
        ),
      },
    }),
    [t],
  );

  const handleDelete = useCallback(async () => {
    if (!encounterUuid) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: messages.error[formType],
        subtitle: t('encounterUuidRequired', 'Encounter UUID is required to delete vitals or biometrics'),
      });
      return;
    }

    setIsDeleting(true);
    deleteEncounter(encounterUuid)
      .then(() => {
        invalidateCachedVitalsAndBiometrics();
        closeDeleteModal();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: messages.success[formType],
        });
      })
      .catch((error) => {
        console.error('Error deleting encounter: ', error);
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: messages.error[formType],
          subtitle: error?.message,
        });
      })
      .finally(() => setIsDeleting(false));
  }, [encounterUuid, messages.error, messages.success, formType, t, closeDeleteModal]);

  return (
    <>
      <ModalHeader closeModal={closeDeleteModal} title={messages.modalTitle[formType]} />
      <ModalBody>
        <p>{messages.modalDescription[formType]}</p>
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
    </>
  );
};

export default DeleteVitalsAndBiometricsModal;
