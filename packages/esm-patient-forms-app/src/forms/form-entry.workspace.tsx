import React from 'react';
import { type Form, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import FormEntry from './form-entry.component';

interface FormEntryWorkspaceProps {
  form: Form;
  encounterUuid: string;
}

/**
 * This workspace renders a React or HTML form to be filled out for a given patient.
 *
 * This workspace must only be used within the patient chart.
 * @see exported-form-entry.workspace.tsx
 */
const FormEntryWorkspace: React.FC<PatientWorkspace2DefinitionProps<FormEntryWorkspaceProps, object>> = ({
  closeWorkspace,
  workspaceProps: { form, encounterUuid },
  groupProps: { patientUuid, patient, visitContext, mutateVisitContext },
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
    />
  );
};

export default FormEntryWorkspace;
