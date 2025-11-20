import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, IconButton } from '@carbon/react';
import { deleteStickyNote, useStickyNotes } from './resources';
import { defineConfigSchema, EditIcon, showModal, showSnackbar, showToast, TrashCanIcon } from '@openmrs/esm-framework';

interface EditStickyNoteProps {
  observationUuid: string;
  patientUuid: string;
  toggleEditingStickyNote: () => void;
}

export const EditStickyNote: React.FC<EditStickyNoteProps> = ({
  observationUuid,
  patientUuid,
  toggleEditingStickyNote,
}) => {
  const { t } = useTranslation();
  return (
    <IconButton
      label={t('editStickyNote', 'Edit sticky note')}
      onClick={toggleEditingStickyNote}
      // @ts-ignore
      kind="ghost"
      size="sm"
    >
      <EditIcon size={16} />
    </IconButton>
  );
};

interface DeleteStickyNoteProps {
  observationUuid: string;
  patientUuid: string;
}

export const DeleteStickyNote: React.FC<DeleteStickyNoteProps> = ({ patientUuid, observationUuid }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const dispose = showModal('delete-sticky-note-confirmation-modal', {
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
    <IconButton
      label={t('deleteStickyNote', 'Delete sticky note')}
      onClick={handleDelete}
      disabled={isDeleting}
      // @ts-ignore
      kind="danger--ghost"
      size="sm"
      iconDescription={t('deleteStickyNote', 'Delete sticky note')}
    >
      <TrashCanIcon size={16} />
    </IconButton>
  );
};
