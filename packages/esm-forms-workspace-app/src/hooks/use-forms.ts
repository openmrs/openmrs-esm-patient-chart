import dayjs from 'dayjs';
import useSWR from 'swr';
import {
  getDynamicOfflineDataEntries,
  openmrsFetch,
  useConfig,
  useVisit,
  interpolateUrl,
} from '@openmrs/esm-framework';
import { ListResponse, Form, EncounterWithFormRef, CompletedFormInfo, FormsSection } from '../types';
import { customEncounterRepresentation, formEncounterUrl, formEncounterUrlPoc } from '../constants';
import { ConfigObject, FormsSectionConfig } from '../config-schema';

export function useForms(cachedOfflineFormsOnly = false, patientUuid: string = '') {
  const { showConfigurableForms, customFormsUrl, showHtmlFormEntryForms } = useConfig() as ConfigObject;
  const url = showConfigurableForms
    ? interpolateUrl('${customFormsUrl}?${patientUuid}', { customFormsUrl: customFormsUrl, patientUuid: patientUuid })
    : showHtmlFormEntryForms
    ? formEncounterUrl
    : formEncounterUrlPoc;

  return useSWR([url, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch<ListResponse<Form>>(url);
    // show published forms and hide component forms
    const forms = showConfigurableForms
      ? res?.data.results
      : res.data?.results?.filter((form) => form.published && !/component/i.test(form.name)) ?? [];

    if (!cachedOfflineFormsOnly) {
      return forms;
    }

    const dynamicFormData = await getDynamicOfflineDataEntries('form');
    return forms.filter((form) => dynamicFormData.some((entry) => entry.identifier === form.uuid));
  });
}

export function useEncounters(patientUuid: string) {
  const { useCurrentVisitDates } = useConfig() as ConfigObject;
  const visits = useVisit(patientUuid);
  let startDate = dayjs(new Date()).startOf('year').subtract(2, 'years').toDate().toISOString();
  let endDate = dayjs(new Date()).endOf('day').toDate().toISOString();

  if (useCurrentVisitDates) {
    startDate = visits?.currentVisit
      ? new Date(visits.currentVisit.startDatetime).toISOString() // Date visit
      : dayjs(new Date()).startOf('year').add(1, 'year').toDate().toISOString(); // Date in the future
  }

  const url = `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate}&todate=${endDate}`;
  return useSWR(url, (url) => openmrsFetch<ListResponse<EncounterWithFormRef>>(url));
}

export function useFormsToDisplay(patientUuid: string, cachedOfflineFormsOnly = false) {
  const { formsSectionsConfig } = useConfig() as ConfigObject;
  const allFormsRes = useForms(cachedOfflineFormsOnly, patientUuid);
  const encountersRes = useEncounters(patientUuid);
  const pastEncounters = encountersRes.data?.data?.results ?? [];
  const data = allFormsRes.data
    ? mapToFormsSectionInfo(formsSectionsConfig, allFormsRes.data, pastEncounters)
    : undefined;
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

function mapToFormsSectionInfo(
  formsSectionsConfig: Array<FormsSectionConfig>,
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<FormsSection> {
  if (formsSectionsConfig) {
    return formsSectionsConfig.map((formsSectionConfig) => {
      return {
        name: formsSectionConfig.name,
        labelCode: formsSectionConfig.labelCode,
        completedFromsInfo: mapToFormCompletedInfo(formsSectionConfig, allForms, encounters),
      };
    });
  } else {
    return [
      {
        name: 'Forms',
        labelCode: 'forms',
        completedFromsInfo: mapFormsToFormCompletedInfo(allForms, encounters),
      },
    ];
  }
}

function mapToFormCompletedInfo(
  formsSectionConfig: FormsSectionConfig,
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return formsSectionConfig.forms
    .map((formConfig) => {
      const form: Form = allForms.find((form) => {
        return form.uuid === formConfig.uuid;
      });
      if (form == undefined) {
        return null;
      }
      const associatedEncounters = getAssociatedEncounters(form.uuid, encounters);
      const lastCompleted = getLastCompletedDate(associatedEncounters);
      return {
        form,
        associatedEncounters,
        lastCompleted,
      };
    })
    .filter((c) => {
      return c;
    });
}

function mapFormsToFormCompletedInfo(
  allForms: Array<Form>,
  encounters: Array<EncounterWithFormRef>,
): Array<CompletedFormInfo> {
  return allForms.map((form) => {
    const associatedEncounters = getAssociatedEncounters(form.uuid, encounters);
    const lastCompleted = getLastCompletedDate(associatedEncounters);
    return {
      form,
      associatedEncounters,
      lastCompleted,
    };
  });
}

function getAssociatedEncounters(
  formUuid: string,
  encounters: Array<EncounterWithFormRef>,
): Array<EncounterWithFormRef> {
  return encounters
    .filter((encounter) => encounter.form?.uuid === formUuid)
    .sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
}

function getLastCompletedDate(associatedEncounters: Array<EncounterWithFormRef>): Date {
  return associatedEncounters.length > 0 ? new Date(associatedEncounters?.[0].encounterDatetime) : undefined;
}
