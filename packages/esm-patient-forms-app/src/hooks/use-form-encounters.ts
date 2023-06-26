import { getDynamicOfflineDataEntries, openmrsFetch, useConfig, useVisit } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { customEncounterRepresentation, formEncounterUrl, formEncounterUrlPoc } from '../constants';
import useSWR from 'swr';
import { EncounterWithFormRef, Form, ListResponse } from '../types';
import dayjs from 'dayjs';

export function useFormEncounters(cachedOfflineFormsOnly = false, patientUuid: string = '') {
  const { customFormsUrl, showHtmlFormEntryForms } = useConfig<ConfigObject>();
  const url = customFormsUrl
    ? customFormsUrl.concat(`?patientUuid=${patientUuid}`)
    : showHtmlFormEntryForms
    ? formEncounterUrl
    : formEncounterUrlPoc;

  return useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch<ListResponse<Form>>(url);
    // show published forms and hide component forms
    const forms = customFormsUrl
      ? res?.data.results
      : res.data?.results?.filter((form) => form.published && !/component/i.test(form.name)) ?? [];

    if (!cachedOfflineFormsOnly) {
      return forms;
    }

    const dynamicFormData = await getDynamicOfflineDataEntries('form');
    return forms.filter((form) => dynamicFormData.some((entry) => entry.identifier === form.uuid));
  });
}

export function useEncounters(
  patientUuid: string,
  startDate: Date = dayjs(new Date()).startOf('day').subtract(500, 'day').toDate(),
  endDate: Date = dayjs(new Date()).endOf('day').toDate(),
) {
  const url = `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`;
  return useSWR(url, (url) => openmrsFetch<ListResponse<EncounterWithFormRef>>(url));
}
