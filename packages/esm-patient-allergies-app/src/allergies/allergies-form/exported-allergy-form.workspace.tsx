import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { AllergyForm, type AllergyFormWorkspaceProps } from './allergy-form.workspace';

export interface ExportedAllergyFormWindowProps {
  patient: fhir.Patient;
  patientUuid: string;
}

/**
 * Allergy form for use outside the patient chart. When launched from a host that doesn't provide
 * the patient-chart workspace group (e.g. as a child of the ward order basket window), the patient
 * context arrives via `windowProps` from the host instead of via `groupProps`.
 *
 * @see allergy-form.workspace.tsx
 */
export default function ExportedAllergyFormWorkspace({
  workspaceProps: { allergy, formContext },
  windowProps: { patient, patientUuid },
  closeWorkspace,
}: Workspace2DefinitionProps<AllergyFormWorkspaceProps, ExportedAllergyFormWindowProps>) {
  return (
    <AllergyForm
      allergy={allergy}
      closeWorkspace={closeWorkspace}
      formContext={formContext}
      patient={patient}
      patientUuid={patientUuid}
    />
  );
}
