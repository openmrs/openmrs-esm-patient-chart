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
import { type PatientWorkspaceGroupProps, useEncounterPrivileges } from '@openmrs/esm-patient-common-lib';
import { rdeOpenedFrom } from '../../constants';

interface EditVisitDetailsActionItemProps {
  visit: Visit;
  patient: fhir.Patient;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;

  /**
   * Identifies where this action item is rendered from. When set to `'RDE'` (the retrospective
   * data entry page), the visit is edited through the `rde-visit-form-workspace` rather than the
   * chart's own visit form.
   */
  openedFrom?: string;

  /**
   * Optional callback run after the visit is successfully edited, so a host (e.g. the RDE visit
   * dashboard) can refresh its visit list. Only used when {@link openedFrom} is `'RDE'`.
   */
  onVisitEdited?: (visit: Visit) => void;
}

/**
 * This component
 */
const EditVisitDetailsActionItem: React.FC<EditVisitDetailsActionItemProps> = ({
  visit,
  patient,
  compact,
  openedFrom,
  onVisitEdited,
}) => {
  const { t } = useTranslation();

  const { canEditPastVisits } = useEncounterPrivileges();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const patientUuid = patient.id;

  const editVisitDetails = () => {
    // For this workspace, the visit context is the visit to edit
    const windowProps = { patient, patientUuid, visitContext: visit };

    if (openedFrom === rdeOpenedFrom) {
      launchWorkspace2<VisitFormProps, VisitFormWindowProps, {}>(
        'rde-visit-form-workspace',
        { openedFrom: rdeOpenedFrom, onVisitStarted: onVisitEdited },
        windowProps,
      );
      return;
    }

    launchWorkspace2<VisitFormProps, VisitFormWindowProps, PatientWorkspaceGroupProps>(
      'start-visit-workspace-form',
      { openedFrom: 'patient-chart-edit-visit' },
      windowProps,
      { patient, patientUuid, activeVisit: visit },
    );
  };

  // Past visits can only be modified by users who may edit past visits
  if (visit?.stopDatetime && !canEditPastVisits) {
    return null;
  }

  return (
    <UserHasAccess privilege="Edit Visits">
      {compact ? (
        <IconButton
          onClick={editVisitDetails}
          label={getCoreTranslation('edit')}
          size={responsiveSize}
          kind="ghost"
          align="left"
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
