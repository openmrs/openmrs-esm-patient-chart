import React from 'react';
import { IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AddIcon } from '@openmrs/esm-framework';

interface AddStickyNoteProps {
  onAddNote: () => void;
}

const AddStickyNote: React.FC<AddStickyNoteProps> = ({ onAddNote }) => {
  const { t } = useTranslation();
  return (
    <IconButton label={t('addStickyNote', 'Add sticky note')} onClick={onAddNote} kind="ghost" size="sm">
      <AddIcon />
    </IconButton>
  );
};
export default AddStickyNote;
