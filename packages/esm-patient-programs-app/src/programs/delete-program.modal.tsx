import React, { useCallback, useState } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, getCoreTranslation } from '@openmrs/esm-framework';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import styles from './delete-program.scss';

interface DeleteProgramProps {
  closeDeleteModal: () => void;
  programEnrollmentId: string;
  patientUuid: string;
}

const DeleteProgramModal: React.FC<DeleteProgramProps> = ({ closeDeleteModal, programEnrollmentId, patientUuid }) => {
  const { t } = useTranslation();
  const { mutateEnrollments } = useEnrollments(patientUuid);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteProgramEnrollment(programEnrollmentId);
      await mutateEnrollments();
      closeDeleteModal();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('programEnrollmentDeleted', 'Program enrollment deleted'),
      });
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingProgram', 'Error deleting program enrollment'),
        subtitle: error?.responseBody?.message ?? error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeDeleteModal, programEnrollmentId, t, mutateEnrollments]);

  return (
    <div>
      <ModalHeader
        closeModal={closeDeleteModal}
        title={t('deletePatientProgramEnrollment', 'Delete program enrollment')}
      />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this program enrollment?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button className={styles.deleteButton} kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{getCoreTranslation('confirm', 'Confirm')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteProgramModal;
