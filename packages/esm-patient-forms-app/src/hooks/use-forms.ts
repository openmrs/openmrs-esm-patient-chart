import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ListResponse, FormEncounter, EncounterWithFormRef, CompletedFormInfo } from '../types';
import { customEncounterRepresentation, formEncounterUrl } from '../constants';
import { isFormFullyCached } from '../offline-forms/offline-form-helpers';

export function useFormEncounters(cachedOfflineFormsOnly = false) {
  const config = useConfig();
  const url = config.showHtmlFormEntryForms ? formEncounterUrl : formEncounterUrl.concat('&q=poc');
  return useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch<ListResponse<FormEncounter>>(url);
    // show published forms and hide component forms
    const forms = res.data?.results?.filter((form) => form.published && !/component/i.test(form.name)) ?? [];

    if (!cachedOfflineFormsOnly) {
      return forms;
    }

    const offlineForms = await Promise.all(forms.map(async (form) => ((await isFormFullyCached(form)) ? form : null)));
    return offlineForms.filter(Boolean);
  });
}

export function useEncountersWithFormRef(
  patientUuid: string,
  startDate: Date = dayjs(new Date()).startOf('day').subtract(500, 'day').toDate(),
  endDate: Date = dayjs(new Date()).endOf('day').toDate(),
) {
  const url = `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`;
  return useSWR(url, (url) => openmrsFetch<ListResponse<EncounterWithFormRef>>(url));
}

export function useForms(patientUuid: string, startDate?: Date, endDate?: Date, cachedOfflineFormsOnly = false) {
  const allFormsRes = useFormEncounters(cachedOfflineFormsOnly);
  const encountersRes = useEncountersWithFormRef(patientUuid, startDate, endDate);
  const pastEncounters = encountersRes.data?.data?.results ?? [];
  const data = allFormsRes.data ? mapToFormCompletedInfo(allFormsRes.data, pastEncounters) : undefined;
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
  };
}

function mapToFormCompletedInfo(
  allForms: Array<FormEncounter>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return allForms.map((form) => {
    const associatedEncounters = encounters
      .filter((encounter) => encounter.form?.uuid === form?.uuid)
      .sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
    const lastCompleted =
      associatedEncounters.length > 0 ? new Date(associatedEncounters?.[0].encounterDatetime) : undefined;

    return {
      form,
      associatedEncounters,
      lastCompleted,
    };
  });
}
