import React from 'react';
import { useSWRConfig } from 'swr';
import { launchWorkspaceGroup2, useVisit, type Visit } from '@openmrs/esm-framework';
import {
  invalidateVisitByUuid,
  type PatientWorkspace2DefinitionProps,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';
import ExportedVisitForm from './exported-visit-form.workspace';

export interface VisitFormProps {
  /**
   * A unique string identifying where the visit form is opened from.
   * This string is passed into various extensions within the form to
   * affect how / if they should be rendered.
   */
  openedFrom: string;
  showPatientHeader?: boolean;
}

/**
 * This form is used for starting a new visit and for editing
 * an existing visit
 *
 * This workspace must only be used within the patient chart.
 * @see exported-visit-form.workspace.tsx
 */
const VisitForm: React.FC<PatientWorkspace2DefinitionProps<VisitFormProps, {}>> = ({
  workspaceProps: { openedFrom, showPatientHeader = false },
  groupProps: { patient, patientUuid, visitContext },
  ...rest
}) => {
  const { mutate: mutateActiveVisit } = useVisit(patientUuid);
  const { mutate: globalMutate } = useSWRConfig();
  const { setVisitContext } = usePatientChartStore(patientUuid);

  const onVisitStarted = (visit: Visit) => {
    // For visit creation, we need to update:
    // 1. Current visit data (for critical components like visit summary, action buttons)
    // 2. Visit history table (for the paginated visit list)
    const mutateSavedOrUpdatedVisit = () => invalidateVisitByUuid(globalMutate, visit.uuid);
    mutateActiveVisit();
    setVisitContext?.(visit, mutateSavedOrUpdatedVisit);

    launchWorkspaceGroup2('patient-chart', {
      patient,
      patientUuid,
      visitContext: visit,
      mutateVisitContext: mutateSavedOrUpdatedVisit,
    });
  };
  return (
    <ExportedVisitForm
      {...rest}
      workspaceProps={{
        openedFrom,
        showPatientHeader,
        onVisitStarted,
        patient,
        patientUuid,
        visitContext,
      }}
      groupProps={{}}
    />
  );
};

export default VisitForm;
