import React from 'react';
import { IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EditIcon } from '@openmrs/esm-framework';

interface EditStickyNoteProps {
  onEdit: () => void;
}

const EditStickyNote: React.FC<EditStickyNoteProps> = ({ onEdit }) => {
  const { t } = useTranslation();

  return (
    <IconButton label={t('editStickyNote', 'Edit sticky note')} onClick={onEdit} kind="ghost" size="sm" align="top-end">
      <EditIcon />
    </IconButton>
  );
};

export default EditStickyNote;
