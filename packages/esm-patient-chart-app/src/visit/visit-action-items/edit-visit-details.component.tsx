import React from 'react';
import { Button, IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  EditIcon,
  UserHasAccess,
  type Visit,
  getCoreTranslation,
  launchWorkspace2,
  useLayoutType,
} from '@openmrs/esm-framework';
import { type VisitFormProps, type VisitFormWindowProps } from '../visit-form/visit-form.workspace';
import { type PatientWorkspaceGroupProps } from '@openmrs/esm-patient-common-lib';

interface EditVisitDetailsActionItemProps {
  visit: Visit;
  patient: fhir.Patient;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

/**
 * This component
 */
const EditVisitDetailsActionItem: React.FC<EditVisitDetailsActionItemProps> = ({ visit, patient, compact }) => {
  const { t } = useTranslation();

  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const patientUuid = patient.id;

  const editVisitDetails = () => {
    // For this workspace, the visit context is the visit to edit
    const windowProps = { patient, patientUuid, visitContext: visit };
    launchWorkspace2<VisitFormProps, VisitFormWindowProps, PatientWorkspaceGroupProps>(
      'start-visit-workspace-form',
      { openedFrom: 'patient-chart-edit-visit' },
      windowProps,
      windowProps,
    );
  };

  return (
    <UserHasAccess privilege="Edit Visits">
      {compact ? (
        <IconButton
          onClick={editVisitDetails}
          label={getCoreTranslation('edit')}
          size={responsiveSize}
          kind="ghost"
          align="top-end"
        >
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
