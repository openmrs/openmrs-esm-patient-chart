import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { deletePatientAllergy, useAllergies } from './allergy-intolerance.resource';

interface DeleteAllergyModalProps {
  closeDeleteModal: () => void;
  allergyId: string;
  patientUuid?: string;
}

const DeleteAllergyModal: React.FC<DeleteAllergyModalProps> = ({ closeDeleteModal, allergyId, patientUuid }) => {
  const { t } = useTranslation();
  const { mutate } = useAllergies(patientUuid);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    deletePatientAllergy(patientUuid, allergyId, new AbortController())
      .then((res) => {
        if (res.ok) {
          mutate();
          closeDeleteModal();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            title: t('allergyDeleted', 'Allergy deleted'),
          });
        }
      })
      .catch((error) => {
        console.error('Error deleting allergy: ', error);

        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('errorDeletingAllergy', 'Error deleting allergy'),
          subtitle: error?.message,
        });
      });
  }, [closeDeleteModal, allergyId, mutate, t]);

  return (
    <div>
      <ModalHeader closeModal={closeDeleteModal} title={t('deletePatientAllergy', 'Delete allergy')} />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this allergy?')}</p>
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

export default DeleteAllergyModal;
