// import { openmrsFetch } from '@openmrs/esm-framework';
// import { Encounter, FormEncounter, Form, EncounterWithFormRef } from '../types';
// import uniqBy from 'lodash-es/uniqBy';
// import useSWR from 'swr';

// const customFormRepresentation =
//   '(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))';
// const customEncounterRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name),form:${customFormRepresentation}`;

// interface ListResponse<T> {
//   results: Array<T>;
// }

// export async function useAllForms() {
//   const url = `/ws/rest/v1/form?v=custom:${customFormRepresentation}`;
//   return useSWR(url, (url) => openmrsFetch<ListResponse<FormEncounter>>(url));
// }

// export async function useEncountersWithFormRef(patientUuid: string, startDate: Date, endDate: Date) {
//   const url = `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`;
//   return useSWR(url, (url) => openmrsFetch<ListResponse<EncounterWithFormRef>>(url));
// }

// export async function

// export async function fetchAllForms() {
//   const res = await openmrsFetch<ListResponse<FormEncounter>>(`/ws/rest/v1/form?v=custom:${customFormRepresentation}`);
//   return res.data.results.map(toEnrichedForm);
// }

// export async function fetchPatientEncountersWithFormRef(patientUuid: string, startDate: Date, endDate: Date) {
//   const res = await openmrsFetch<ListResponse<EncounterWithFormRef>>(
//     `/ws/rest/v1/encounter?v=${customEncounterRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`,
//   );

//   const encountersWithForm = res.data.results
//     .map(toEnrichedEncounter)
//     .filter((encounter) => !!encounter.form)
//     .sort((encounterA, encounterB) => encounterB.encounterDatetime.getTime() - encounterA.encounterDatetime.getTime());
//   return uniqBy(encountersWithForm, 'form.uuid');
// }

// function toEnrichedEncounter(encounter: EncounterWithFormRef): Encounter {
//   return {
//     ...encounter,
//     encounterDatetime: new Date(encounter.encounterDatetime),
//     encounterTypeUuid: encounter.encounterType?.uuid,
//     encounterTypeName: encounter.encounterType?.name,
//     form: encounter.form ? toEnrichedForm(encounter.form) : null,
//   };
// }

// function toEnrichedForm(formEncounter: FormEncounter): Form {
//   return {
//     ...formEncounter,
//     encounterTypeUuid: formEncounter.encounterType?.uuid,
//     encounterTypeName: formEncounter.encounterType?.name,
//   };
// }
