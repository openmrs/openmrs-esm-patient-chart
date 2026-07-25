import React from 'react';
import { type Encounter } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import ExportedVisitNotesForm from './exported-visit-notes-form.workspace';

export interface VisitNotesFormProps {
  encounter?: Encounter;
  formContext: 'creating' | 'editing';
}

/**
 * This workspace displays the form to record a patient's visit note.
 *
 * This workspace must only be used within the patient chart.
 * @see exported-visit-notes-form.workspace.tsx
 */
const VisitNotesForm: React.FC<PatientWorkspace2DefinitionProps<VisitNotesFormProps, {}>> = ({
  workspaceProps: { encounter, formContext = 'creating' },
  groupProps: { patientUuid, patient, visitContext },
  ...rest
}) => {
  return (
    <ExportedVisitNotesForm
      workspaceProps={{ encounter, formContext, patientUuid, patient, visitContext }}
      windowProps={null}
      groupProps={null}
      {...rest}
    />
  );
};

export default VisitNotesForm;
