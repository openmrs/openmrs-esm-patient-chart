import { Form, EncounterWithFormRef, CompletedFormInfo } from '../types';
import { useEncounters, useFormEncounters } from './use-form-encounters';

export function useForm(patientUuid: string, startDate?: Date, endDate?: Date, cachedOfflineFormsOnly = false) {
  const allFormsRes = useFormEncounters(cachedOfflineFormsOnly, patientUuid);
  const encountersRes = useEncounters(patientUuid, startDate, endDate);
  const pastEncounters = encountersRes.data?.data?.results ?? [];
  const data = allFormsRes.data ? mapToFormCompletedInfo(allFormsRes.data, pastEncounters) : undefined;

  const mutateForms = () => {
    allFormsRes.mutate();
    encountersRes.mutate();
  };
  // Note:
  // `pastEncounters` is currently considered as optional (i.e. any errors are ignored) since it's only used for display
  // and doesn't change any functional flows. This makes offline mode much easier to implement since the past encounters
  // don't have to be cached regularly.
  // If this ever becomes a problem for online mode (i.e. if an error should be rendered there when past encounters
  // for determining filled out forms can't be loaded) this should ideally be conditionally controlled via a flag
  // such that the current offline behavior doesn't change.

  return {
    data,
    error: allFormsRes.error,
    isValidating: allFormsRes.isValidating || encountersRes.isValidating,
    allForms: allFormsRes.data,
    mutateForms,
  };
}

function mapToFormCompletedInfo(
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return allForms.map((form) => {
    const associatedEncounters = encounters
      .filter((encounter) => encounter.form?.uuid === form?.uuid)
      .sort((a, b) => (a.form?.display > b.form?.display ? 1 : -1));
    const lastCompleted =
      associatedEncounters.length > 0 ? new Date(associatedEncounters?.[0].encounterDatetime) : undefined;

    return {
      form,
      associatedEncounters,
      lastCompleted,
    };
  });
}
