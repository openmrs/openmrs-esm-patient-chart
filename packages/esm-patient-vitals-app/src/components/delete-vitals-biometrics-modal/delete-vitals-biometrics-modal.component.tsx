import React, { useState, useCallback, useMemo } from 'react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useVitalsAndBiometrics } from '../../common';
import {
  useVitalsOrBiometricsConcepts,
  useEncounterVitalsAndBiometrics,
  createOrUpdateVitalsAndBiometrics,
} from '../../common/data.resource';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';

interface DeleteVitalsAndBiometricsModalProps {
  patientUuid: string;
  encounterUuid: string;
  formType: 'vitals' | 'biometrics';
  closeDeleteModal: () => void;
}

const DeleteVitalsAndBiometricsModal: React.FC<DeleteVitalsAndBiometricsModalProps> = ({
  patientUuid,
  encounterUuid,
  formType,
  closeDeleteModal,
}) => {
  const { t } = useTranslation();
  const { mutate } = useVitalsAndBiometrics(patientUuid, formType);
  const [isDeleting, setIsDeleting] = useState(false);
  const targetConcepts = useVitalsOrBiometricsConcepts(formType);
  const {
    encounter,
    isLoading: isLoadingEncounter,
    mutate: mutateEncounter,
  } = useEncounterVitalsAndBiometrics(encounterUuid);

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
        vitals: t('deleteVitalsConfirmationText', 'Are you sure you want to delete these Vitals entries?'),
        biometrics: t('deleteBiometricsConfirmationText', 'Are you sure you want to delete these Biometrics entries?'),
      },
    }),
    [t],
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    if (!isLoadingEncounter && encounter) {
      const obsToVoid = encounter.obs
        .filter((obs) => targetConcepts.includes(obs.concept.uuid))
        .map((obs) => ({ uuid: obs.uuid, voided: true }));

      createOrUpdateVitalsAndBiometrics(
        patientUuid,
        encounter.encounterType.uuid,
        encounter.uuid,
        null,
        obsToVoid,
        new AbortController(),
      )
        .then((res) => {
          mutate();
          mutateEncounter();
          closeDeleteModal();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            title: messages.success[formType],
          });
        })
        .catch((error) => {
          console.error('Error deleting biometrics: ', error);
          showSnackbar({
            isLowContrast: false,
            kind: 'error',
            title: messages.error[formType],
            subtitle: error?.message,
          });
        })
        .finally(() => setIsDeleting(false));
    }
  }, [
    isLoadingEncounter,
    encounter,
    patientUuid,
    targetConcepts,
    messages.success,
    messages.error,
    formType,
    closeDeleteModal,
    mutate,
    mutateEncounter,
  ]);

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
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteVitalsAndBiometricsModal;
