import React, { useState, useCallback } from 'react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { deleteEncounter, invalidateCachedVitalsAndBiometrics } from '../../common';
import { ModalHeader, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';
import { useFocusTrap } from '@openmrs/esm-patient-common-lib';

interface DeleteVitalsAndBiometricsModalProps {
  patientUuid: string;
  encounterUuid: string;
  closeDeleteModal: () => void;
}

const DeleteVitalsAndBiometricsModal: React.FC<DeleteVitalsAndBiometricsModalProps> = ({
  encounterUuid,
  closeDeleteModal,
}) => {
  const { t } = useTranslation();
  const containerRef = useFocusTrap();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!encounterUuid) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeleting', 'Error deleting vitals and biometrics'),
        subtitle: t('encounterUuidRequired', 'Encounter UUID is required to delete vitals and biometrics'),
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
          title: t('vitalsAndBiometricsDeleted', 'Vitals and biometrics deleted'),
        });
      })
      .catch((error) => {
        console.error('Error deleting encounter: ', error);
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('errorDeleting', 'Error deleting vitals and biometrics'),
          subtitle: error?.message,
        });
      })
      .finally(() => setIsDeleting(false));
  }, [encounterUuid, t, closeDeleteModal]);

  return (
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <ModalHeader
        closeModal={closeDeleteModal}
        title={t('deleteVitalsAndBiometrics', 'Delete vitals and biometrics')}
      />
      <ModalBody>
        <p>
          {t(
            'deleteConfirmationText',
            'Note: Deleting these entries will also remove related vitals or biometrics data. Are you sure you want to continue?',
          )}
        </p>
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

export default DeleteVitalsAndBiometricsModal;
