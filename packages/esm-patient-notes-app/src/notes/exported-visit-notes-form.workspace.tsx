import React from 'react';
import { type Encounter, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import VisitNotesForm from './visit-notes-form.component';

export interface ExportedVisitNotesFormWorkspaceProps {
  encounter?: Encounter;
  formContext: 'creating' | 'editing';
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
}

/**
 * This workspace is meant for use outside the patient chart.
 * @see visit-notes-form.workspace.tsx
 */
const ExportedVisitNotesFormWorkspace: React.FC<
  Workspace2DefinitionProps<ExportedVisitNotesFormWorkspaceProps, {}, {}>
> = ({ closeWorkspace, workspaceProps: { encounter, formContext, patientUuid, patient, visitContext } }) => {
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

export default ExportedVisitNotesFormWorkspace;
