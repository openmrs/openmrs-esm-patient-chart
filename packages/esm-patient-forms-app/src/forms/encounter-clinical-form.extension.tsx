import React from 'react';
import { ExportedWorkspace } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';

/**
 * Renders the form entry workspace inside the encounter workspace for encounters created from a form
 */
const EncounterClinicalForm: React.FC<EncounterWorkspaceSlotState> = ({
  workspaceType,
  encounter,
  additionalProps,
  groupProps,
  onWindowChanged,
}) => {
  const matches = workspaceType ? workspaceType === 'clinical-form' : Boolean(encounter?.form);

  if (!matches || !encounter) {
    return null;
  }

  return (
    <ExportedWorkspace
      name="patient-form-entry-workspace"
      workspaceProps={{
        form: encounter.form,
        encounterUuid: encounter.uuid,
        additionalProps,
      }}
      groupProps={groupProps}
      onWindowChanged={onWindowChanged}
    />
  );
};

export default EncounterClinicalForm;
