import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading } from '@carbon/react';
import { deleteStickyNote, useStickyNotes } from './resources';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';

interface DeleteStickyNoteConfirmationModalProps {
  closeModal: () => void;
  observationUuid: string;
  patientUuid: string;
}

const DeleteStickyNoteConfirmationModal: React.FC<DeleteStickyNoteConfirmationModalProps> = ({
  closeModal,
  observationUuid,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateStickyNotes } = useStickyNotes(patientUuid);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    deleteStickyNote(observationUuid)
      .then(() => {
        showSnackbar({
          title: t('stickyNoteDeleted', 'Sticky note deleted'),
          kind: 'success',
        });
        mutateStickyNotes();
        closeModal();
      })
      .catch((err) => {
        showSnackbar({
          title: t('errorDeletingStickyNote', 'Error deleting sticky note'),
          kind: 'error',
          subtitle: err?.message,
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [observationUuid, mutateStickyNotes, t, closeModal]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('deleteStickyNote', 'Delete sticky note')} />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this sticky note?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" size="lg" onClick={closeModal}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="danger" size="lg" onClick={handleDelete} disabled={isDeleting}>
          {!isDeleting ? (
            getCoreTranslation('delete')
          ) : (
            <InlineLoading description={t('deletionInProgress', 'Deleting...')} />
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteStickyNoteConfirmationModal;
