import React from 'react';
import { Button, IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  EditIcon,
  UserHasAccess,
  type Visit,
  getCoreTranslation,
  launchWorkspace,
  useLayoutType,
} from '@openmrs/esm-framework';

interface EditVisitDetailsActionItemProps {
  patientUuid: string;
  visit: Visit;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

const EditVisitDetailsActionItem: React.FC<EditVisitDetailsActionItemProps> = ({ visit, compact }) => {
  const { t } = useTranslation();

  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const editVisitDetails = () => {
    launchWorkspace('start-visit-workspace-form', {
      workspaceTitle: t('editVisitDetails', 'Edit visit details'),
      visitToEdit: visit,
      openedFrom: 'patient-chart-edit-visit',
    });
  };

  return (
    <UserHasAccess privilege="Edit Visits">
      {compact ? (
        <IconButton onClick={editVisitDetails} label={getCoreTranslation('edit')} size={responsiveSize} kind="ghost">
          <EditIcon size={16} />
        </IconButton>
      ) : (
        <Button onClick={editVisitDetails} kind="ghost" renderIcon={EditIcon} size={responsiveSize}>
          {t('editVisitDetails', 'Edit visit details')}
        </Button>
      )}
    </UserHasAccess>
  );
};

export default EditVisitDetailsActionItem;
