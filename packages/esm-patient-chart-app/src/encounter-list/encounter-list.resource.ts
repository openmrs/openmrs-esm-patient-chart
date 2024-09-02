import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { type Form } from './types';
import useSWR from 'swr';

export function fetchOpenMRSForms(formNames: string[]) {
  const fetch = (name) => openmrsFetch(`/ws/rest/v1/form?q=${name}&v=full`);
  return Promise.all(formNames.map((name) => fetch(name)));
}

export function fetchOpenMRSForms2(formUuids: string[]) {
  const fetch = (uuid) => openmrsFetch(`/ws/rest/v1/form/${uuid}`);
  return Promise.all(formUuids.map((uuid) => fetch(uuid)));
}

export function fetchFormsClobData(valueReferences: string[]) {
  const fetch = (ref: string) => openmrsFetch(`/ws/rest/v1/clobdata/${ref}`);
  return Promise.all(valueReferences?.map((ref) => fetch(ref)));
}

export function fetchPatientRelationships(patientUuid: string) {
  return openmrsFetch(`${restBaseUrl}relationship?person=${patientUuid}&v=full`).then(({ data }) => {
    if (data.results.length) {
      return data.results;
    }
    return null;
  });
}

export const useO3FormSchema = (formUuid: string) => {
  const url = formUuid ? `${restBaseUrl}/o3/forms/${formUuid}` : null;

  const { data, error, isLoading } = useSWR<{ data: FormSchema }>(url, openmrsFetch);

  const schema = { ...data?.data, encounterType: data?.data.encounterType['uuid'] };

  return { schema, error, isLoading };
};

export const customFormRepresentation =
  'custom:(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))';

export const useO3Forms = (patientUuid: string) => {
  const url = `${restBaseUrl}/form?v=${customFormRepresentation}`;

  const { data, error, isLoading } = useSWR<{ results: Array<Form> }, Error>(url, (url) =>
    openmrsFetch<{ results: Array<Form> }>(url).then((response) => response.data),
  );

  const schemas = data?.results?.map((form) => ({
    ...form,
    encounterType: form.encounterType['uuid'],
  }));

  return { o3Forms: schemas, error, isLoading };
};
