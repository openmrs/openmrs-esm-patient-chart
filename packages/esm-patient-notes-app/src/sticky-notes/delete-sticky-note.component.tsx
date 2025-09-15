import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, IconButton } from '@carbon/react';
import { deleteStickyNote, useStickyNotes } from './resources';
import { defineConfigSchema, showModal, showSnackbar, showToast, TrashCanIcon } from '@openmrs/esm-framework';

interface DeleteStickyNoteProps {
  observationUuid: string;
  patientUuid: string;
}

const DeleteStickyNote: React.FC<DeleteStickyNoteProps> = ({ patientUuid, observationUuid }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const dispose = showModal('delete-sticky-note-modal', {
      closeModal: () => {
        setIsDeleting(false);
        dispose();
      },
      observationUuid,
      patientUuid,
      setIsDeleting,
    });
  }, [observationUuid, patientUuid, setIsDeleting]);

  return (
    <IconButton label={t('deleteStickyNote', 'Delete sticky note')} onClick={handleDelete} disabled={isDeleting}>
      <TrashCanIcon size={48} />
    </IconButton>
  );
};

export default DeleteStickyNote;
