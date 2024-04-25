import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalHeader, ModalFooter } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import {
  deleteVitalsAndBiometrics,
  getEncounterByUuid,
  invalidateCachedVitalsAndBiometrics,
} from '../common/data.resource';

interface DeleteVitalModalProps {
  closeDeleteModal: () => void;
  encounterUuid: string;
  patientUuid: string;
}

const DeleteVitalsBiometricsModal = ({ closeDeleteModal, encounterUuid }: DeleteVitalModalProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const voidVitalsInEncounter = async (encounterUuid: string) => {
    try {
      const response = await getEncounterByUuid(encounterUuid);
      if (!response?.data) {
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('encounterNotFound', 'Encounter not found'),
        });
      }

      const updatedEncounter = {
        ...response.data,
        obs: response.data.obs?.map((obs) => ({ ...obs, voided: true })) || [],
      };

      return updatedEncounter;
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorVoidingVitals', 'Error voiding vitals'),
      });
    }
  };
  const handleDeleteVitalsAndBiometrics = async () => {
    setIsDeleting(true);
    const encounter = await voidVitalsInEncounter(encounterUuid);
    try {
      const response = await deleteVitalsAndBiometrics(encounterUuid, encounter);

      if (response.status === 200) {
        invalidateCachedVitalsAndBiometrics();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('vitalsAndBiometricsDeleted', 'Vitals and Biometrics deleted'),
        });
      }
    } catch (error) {
      console.error('Error deleting vitals and biometrics: ', error);

      showSnackbar({
        title: t('vitalsAndBiometricsDeleteError', 'Error deleting Vitals and Biometrics'),
        kind: 'error',
        isLowContrast: false,
      });
    } finally {
      closeDeleteModal();
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ModalHeader
        closeModal={closeDeleteModal}
        title={t('deletePatientVitalsAndBiometrics', 'Delete Vitals and Biometrics')}
      />
      <ModalBody>
        <p>
          {t(
            'deleteVitalsBiometricsConfirmationText',
            'Are you sure you want to delete these Vitals and Biometrics entries?',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDeleteVitalsAndBiometrics} disabled={isDeleting}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};
export default DeleteVitalsBiometricsModal;
