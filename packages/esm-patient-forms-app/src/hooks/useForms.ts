import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { ListResponse, FormEncounter, EncounterWithFormRef, CompletedFormInfo } from '../types';
import { customEncounterRepresentation, formEncounterUrl } from '../constants';

export function useFormEncounters() {
  return useSWR(formEncounterUrl, (url) => openmrsFetch<ListResponse<FormEncounter>>(url));
}

export function useEncountersWithFormRef(
  patientUuid: string,
  startDate: Date = dayjs(new Date()).startOf('day').subtract(500, 'day').toDate(),
  endDate: Date = dayjs(new Date()).endOf('day').toDate(),
) {
  const url = `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`;
  return useSWR(url, (url) => openmrsFetch<ListResponse<EncounterWithFormRef>>(url));
}

export function useForms(patientUuid: string, startDate?: Date, endDate?: Date) {
  const allFormsRes = useFormEncounters();
  const encountersRes = useEncountersWithFormRef(patientUuid, startDate, endDate);
  const data = allFormsRes.data
    ? mapToFormCompletedInfo(allFormsRes.data.data.results, encountersRes.data?.data?.results ?? [])
    : undefined;

  return {
    data,
    error: allFormsRes.error,
    isValidating: allFormsRes.isValidating || encountersRes.isValidating,
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
