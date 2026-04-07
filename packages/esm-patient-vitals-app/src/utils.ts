import { useCallback } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';
import { invalidateCachedVitalsAndBiometrics } from './common';

/**
 * Launches the appropriate workspace based on the current visit and configuration.
 * @param currentVisit - The current visit.
 * @param config - The configuration object.
 */
export function useLaunchVitalsAndBiometricsForm(patientUuid: string) {
  const { mutateVisitContext, visitContext, patient } = usePatientChartStore(patientUuid);
  const config = useConfig<ConfigObject>();
  const { useFormEngine, formName, formUuid } = config.vitals;
  const launchVitalsAndBiometricsForm = useLaunchWorkspaceRequiringVisit(
    patientUuid,
    useFormEngine ? 'patient-form-entry-workspace' : patientVitalsBiometricsFormWorkspace,
  );

  const launchVitalsAndBiometricsFormNoParams = useCallback(() => {
    const workspaceProps = useFormEngine
      ? {
          workspaceTitle: formName,
          form: { uuid: formUuid },
          encounterUuid: '',
        }
      : {};

    const groupProps = {
      patient,
      patientUuid,
      visitContext,
      mutateVisitContext: () => {
        mutateVisitContext?.();
        invalidateCachedVitalsAndBiometrics();
      },
    };

    launchVitalsAndBiometricsForm(workspaceProps, {}, groupProps);
  }, [
    useFormEngine,
    formName,
    formUuid,
    launchVitalsAndBiometricsForm,
    visitContext,
    mutateVisitContext,
    patient,
    patientUuid,
  ]);

  return launchVitalsAndBiometricsFormNoParams;
}
