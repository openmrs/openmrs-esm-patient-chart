import React from 'react';
import { ExportedWorkspace, useConfig } from '@openmrs/esm-framework';
import { type EncounterWorkspaceSlotState } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

/**
 * Renders the vitals and biometrics form inside the encounter workspace for vitals encounters
 */
const EncounterVitals: React.FC<EncounterWorkspaceSlotState> = ({
  workspaceType,
  encounter,
  onEncounterSaved,
  windowProps,
  onWindowChanged,
}) => {
  const { vitals } = useConfig<ConfigObject>();

  const matches = workspaceType
    ? workspaceType === 'vitals'
    : !encounter?.form && encounter?.encounterType?.uuid === vitals.encounterTypeUuid;

  if (!matches) {
    return null;
  }

  return (
    <ExportedWorkspace
      name="patient-vitals-biometrics-form-workspace"
      workspaceProps={{
        editEncounterUuid: encounter?.uuid,
        formContext: encounter ? 'editing' : 'creating',
        onEncounterSaved,
      }}
      windowProps={windowProps}
      onWindowChanged={onWindowChanged}
    />
  );
};

export default EncounterVitals;
