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
import { type VisitFormProps } from '../visit-form/visit-form.workspace';
import {
  invalidateVisitAndEncounterData,
  invalidateVisitByUuid,
  type PatientWorkspaceGroupProps,
} from '@openmrs/esm-patient-common-lib';
import { useSWRConfig } from 'swr';

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
  const { mutate: globalMutate } = useSWRConfig();

  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const patientUuid = patient.id;

  const editVisitDetails = () => {
    launchWorkspace2<VisitFormProps, {}, PatientWorkspaceGroupProps>(
      'start-visit-workspace-form',
      { openedFrom: 'patient-chart-edit-visit' },
      {},
      {
        patient,
        patientUuid: patientUuid,
        visitContext: visit,
        mutateVisitContext: () => {
          invalidateVisitByUuid(globalMutate, visit.uuid);
          invalidateVisitAndEncounterData(globalMutate, patientUuid);
        },
      },
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
