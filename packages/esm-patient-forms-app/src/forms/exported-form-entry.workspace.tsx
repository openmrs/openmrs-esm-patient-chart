import React from 'react';
import { type Workspace2DefinitionProps, type Encounter } from '@openmrs/esm-framework';
import { type Form } from '@openmrs/esm-patient-common-lib';
import FormEntry from './form-entry.component';
import { type ExportedClinicalFormsWindowProps } from './exported-forms-dashboard.workspace';

interface FormEntryWorkspaceProps {
  form: Form;
  encounterUuid: string;
  handlePostResponse?: (encounter: Encounter) => void;
}

/**
 * This workspace is meant for use outside the patient chart.
 *
 * @see form-entry.workspace.tsx
 */
const ExportedFormEntryWorkspace: React.FC<
  Workspace2DefinitionProps<FormEntryWorkspaceProps, ExportedClinicalFormsWindowProps, {}>
> = ({
  closeWorkspace,
  workspaceProps: { form, encounterUuid, handlePostResponse },
  windowProps: { patient, patientUuid, visitContext, mutateVisitContext },
}) => {
  return (
    <FormEntry
      form={form}
      encounterUuid={encounterUuid}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      mutateVisitContext={mutateVisitContext}
      closeWorkspace={closeWorkspace}
      handlePostResponse={handlePostResponse}
    />
  );
};

export default ExportedFormEntryWorkspace;
