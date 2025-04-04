import { useConfig } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';
import { invalidateCachedVitalsAndBiometrics } from './common';
import { useCallback } from 'react';

/**
 * Launches the appropriate workspace based on the current visit and configuration.
 * @param currentVisit - The current visit.
 * @param config - The configuration object.
 */
export function useLaunchVitalsAndBiometricsForm() {
  const config = useConfig<ConfigObject>();
  const { useFormEngine, formName, formUuid } = config.vitals;
  const launchVitalsAndBiometricsForm = useLaunchWorkspaceRequiringVisit(
    useFormEngine ? 'patient-form-entry-workspace' : patientVitalsBiometricsFormWorkspace,
  );

  const launchVitalsAndBiometricsFormNoParams = useCallback(() => {
    const workspaceProps = useFormEngine
      ? {
          workspaceTitle: formName,
          formInfo: { formUuid, encounterUuid: '' },
          mutateForm: invalidateCachedVitalsAndBiometrics,
        }
      : {};
    launchVitalsAndBiometricsForm(workspaceProps);
  }, [useFormEngine, formName, formUuid, launchVitalsAndBiometricsForm]);

  return launchVitalsAndBiometricsFormNoParams;
}
