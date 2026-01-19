import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { EditIcon } from '@openmrs/esm-framework';

interface EditStickyNoteProps {
  toggleEditingStickyNote: () => void;
}

const EditStickyNote: React.FC<EditStickyNoteProps> = ({ toggleEditingStickyNote }) => {
  const { t } = useTranslation();

  return (
    <IconButton
      label={t('editStickyNote', 'Edit sticky note')}
      onClick={toggleEditingStickyNote}
      kind="ghost"
      size="sm"
    >
      <EditIcon />
    </IconButton>
  );
};

export default EditStickyNote;
