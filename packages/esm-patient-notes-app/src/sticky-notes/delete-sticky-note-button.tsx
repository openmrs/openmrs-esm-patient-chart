import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { showModal, TrashCanIcon } from '@openmrs/esm-framework';
import styles from './delete-sticky-note-button.scss';

interface DeleteStickyNoteProps {
  noteUuid: string;
  mutate: () => void;
  onClose: () => void;
}

const DeleteStickyNote: React.FC<DeleteStickyNoteProps> = ({ noteUuid, mutate, onClose }) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    const dispose = showModal('delete-sticky-note-modal', {
      close: () => {
        dispose();
      },
      noteUuid,
      mutate,
      onClose,
    });
  };
  return (
    <IconButton label={t('deleteStickyNote', 'Delete sticky note')} onClick={handleDelete} kind="ghost" size="sm">
      <TrashCanIcon className={styles.deleteIcon} />
    </IconButton>
  );
};

export default DeleteStickyNote;
