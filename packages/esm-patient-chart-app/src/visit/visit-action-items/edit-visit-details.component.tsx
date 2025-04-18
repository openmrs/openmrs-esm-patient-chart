import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, UserHasAccess, type Visit, getCoreTranslation, useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface EditVisitDetailsActionItemProps {
  patientUuid: string;
  visit: Visit;

  /**
   * If true, renders the button with fewer words
   */
  compact?: boolean;
}

const EditVisitDetailsActionItem: React.FC<EditVisitDetailsActionItemProps> = ({ visit, compact }) => {
  const { t } = useTranslation();

  const isTablet = useLayoutType() === 'tablet';

  const editVisitDetails = () => {
    launchPatientWorkspace('start-visit-workspace-form', {
      workspaceTitle: t('editVisitDetails', 'Edit visit details'),
      visitToEdit: visit,
      openedFrom: 'patient-chart-edit-visit',
    });
  };

  const buttonLabel = compact ? getCoreTranslation('edit') : t('editVisitDetails', 'Edit visit details');

  return (
    <UserHasAccess privilege="Edit Visits">
      <Button onClick={editVisitDetails} kind="ghost" renderIcon={EditIcon} size={isTablet ? 'lg' : 'sm'}>
        {buttonLabel}
      </Button>
    </UserHasAccess>
  );
};

export default EditVisitDetailsActionItem;
