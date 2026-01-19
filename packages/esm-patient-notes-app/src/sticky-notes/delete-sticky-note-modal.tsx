import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteStickyNote } from './resources';

interface DeleteStickyNoteModalProps {
  close: () => void;
  noteUuid: string;
  mutate: () => void;
  onClose: () => void;
}

const DeleteStickyNoteModal = ({ close, noteUuid, mutate, onClose }: DeleteStickyNoteModalProps) => {
  const { t } = useTranslation();

  const confirmDelete = useCallback(async () => {
    try {
      await deleteStickyNote(noteUuid);
      showSnackbar({
        kind: 'success',
        title: t('stickyNoteDeleted', 'Sticky note deleted'),
        subtitle: t('stickyNoteDeletedSuccessfully', 'The sticky note has been deleted successfully'),
      });
      mutate();
      close();
      onClose();
    } catch (err) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingStickyNote', 'Error deleting sticky note'),
        subtitle: t('errorDeletingStickyNoteMessage', 'An error occurred while deleting the sticky note'),
      });
    }
  }, [noteUuid, mutate, close, onClose, t]);
  return (
    <>
      <ModalHeader closeModal={close}>{t('confirmDeleteStickyNote', 'Confirm Delete Sticky Note')}</ModalHeader>
      <ModalBody>
        <p>{t('confirmDeleteStickyNoteMessage', 'Are you sure you want to delete this sticky note?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={confirmDelete}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteStickyNoteModal;
