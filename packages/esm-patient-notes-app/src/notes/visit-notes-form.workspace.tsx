import React from 'react';
import { type Encounter } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import VisitNotesForm from './visit-notes-form.component';

export interface VisitNotesFormWorkspaceProps {
  encounter?: Encounter;
  formContext: 'creating' | 'editing';
}

/**
 * This workspace displays the form to record a patient's visit note.
 *
 * This workspace must only be used within the patient chart.
 * @see exported-visit-notes-form.workspace.tsx
 */
const VisitNotesFormWorkspace: React.FC<PatientWorkspace2DefinitionProps<VisitNotesFormWorkspaceProps, {}>> = ({
  closeWorkspace,
  workspaceProps: { encounter, formContext = 'creating' },
  groupProps: { patientUuid, patient, visitContext },
}) => {
  return (
    <VisitNotesForm
      encounter={encounter}
      formContext={formContext}
      patientUuid={patientUuid}
      patient={patient}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
    />
  );
};

export default VisitNotesFormWorkspace;
