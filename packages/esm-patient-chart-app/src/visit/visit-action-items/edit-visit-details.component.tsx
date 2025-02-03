import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, UserHasAccess, type Visit, useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface EditVisitDetailsActionItemProps {
  patientUuid: string;
  visit: Visit;
}

const EditVisitDetailsActionItem: React.FC<EditVisitDetailsActionItemProps> = ({ visit }) => {
  const { t } = useTranslation();

  const isTablet = useLayoutType() === 'tablet';

  const editVisitDetails = () => {
    launchPatientWorkspace('start-visit-workspace-form', {
      workspaceTitle: t('editVisitDetails', 'Edit visit details'),
      visitToEdit: visit,
      openedFrom: 'patient-chart-edit-visit',
    });
  };

  return (
    <UserHasAccess privilege="Edit Visits">
      <Button onClick={editVisitDetails} kind="ghost" renderIcon={EditIcon} size={isTablet ? 'lg' : 'sm'}>
        {t('editVisitDetails', 'Edit visit details')}
      </Button>
    </UserHasAccess>
  );
};

export default EditVisitDetailsActionItem;
