import { useFeatureFlag } from '@openmrs/esm-framework';
import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

/**
 * Returns true when the patient chart's visit context is set to a past (ended) visit
 * and retrospective data entry applies, i.e. system visits are enabled and the `rde`
 * feature flag is turned on.
 *
 * The past visit tag renders exactly when this is true, and the active visit tag
 * hides under the same condition. Sharing this predicate keeps the two in sync so
 * the banner can never end up with neither tag while an active visit exists.
 */
export function useIsInPastVisitContext(patientUuid: string): boolean {
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');
  const { visitContext } = usePatientChartStore(patientUuid);
  return Boolean(systemVisitEnabled && isRdeEnabled && visitContext?.stopDatetime);
}
