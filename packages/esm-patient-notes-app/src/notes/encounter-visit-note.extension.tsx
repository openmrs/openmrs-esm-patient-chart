import React from 'react';
import { ExportedWorkspace, useConfig } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

/**
 * Renders the visit note form inside the encounter workspace for visit note encounters
 */
const EncounterVisitNote: React.FC<EncounterWorkspaceSlotState> = ({
  workspaceType,
  encounter,
  groupProps,
  onWindowChanged,
}) => {
  const { visitNoteConfig } = useConfig<ConfigObject>();

  const matches = workspaceType
    ? workspaceType === 'visit-note'
    : !encounter?.form && encounter?.encounterType?.uuid === visitNoteConfig.encounterTypeUuid;

  if (!matches) {
    return null;
  }

  return (
    <ExportedWorkspace
      name="visit-notes-form-workspace"
      workspaceProps={{
        encounter,
        formContext: encounter ? 'editing' : 'creating',
      }}
      groupProps={groupProps}
      onWindowChanged={onWindowChanged}
    />
  );
};

export default EncounterVisitNote;
