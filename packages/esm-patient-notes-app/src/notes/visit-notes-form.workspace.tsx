import React from 'react';
import { type Encounter, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  type DeprecatedPatientWorkspaceProps,
  getPatientAndVisitProps,
  type PatientWorkspaceWindowProps,
} from '@openmrs/esm-patient-common-lib';
import VisitNotesForm from './visit-notes-form.component';

export type VisitNotesFormWorkspaceProps = {
  encounter?: Encounter;
  formContext: 'creating' | 'editing';
} & DeprecatedPatientWorkspaceProps;

/**
 * This workspace displays the form to record a patient's visit note.
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart. Callers that have not migrated yet may still pass
 * `patient`, `patientUuid` and `visitContext` as (deprecated) workspace props; window props win.
 */
const VisitNotesFormWorkspace: React.FC<
  Workspace2DefinitionProps<VisitNotesFormWorkspaceProps, PatientWorkspaceWindowProps, object>
> = ({ closeWorkspace, workspaceProps, windowProps }) => {
  const { encounter, formContext = 'creating' } = workspaceProps;
  const { patient, patientUuid, visitContext } = getPatientAndVisitProps(windowProps, workspaceProps);

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
