import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import includes from 'lodash-es/includes';
import split from 'lodash-es/split';
import { FHIRImmunizationBundle, FHIRImmunizationResource, OpenmrsConcept } from '../types/fhir-immunization-domain';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';

// TODO: Remove and and use useFormMetadata
function getImmunizationsConceptSetByUuid(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController,
): Promise<OpenmrsConcept> {
  return openmrsFetch(`/ws/rest/v1/concept/${immunizationsConceptSetSearchText}?v=full`, {
    signal: abortController.signal,
  }).then((response) => response.data);
}

function isConceptMapping(searchText: string) {
  return includes(searchText, ':');
}

// TODO: Remove and and use useFormMetadata
function searchImmunizationsConceptSetByMapping(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController,
): Promise<OpenmrsConcept> {
  const [source, code] = split(immunizationsConceptSetSearchText, ':');
  return openmrsFetch(`/ws/rest/v1/concept?source=${source}&code=${code}&v=full`, {
    signal: abortController.signal,
  }).then((response) => {
    return response.data.results[0];
  });
}

// TODO: Remove and and use useFormMetadata
export async function getImmunizationsConceptSet(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController,
): Promise<OpenmrsConcept> {
  const result = isConceptMapping(immunizationsConceptSetSearchText)
    ? await searchImmunizationsConceptSetByMapping(immunizationsConceptSetSearchText, abortController)
    : await getImmunizationsConceptSetByUuid(immunizationsConceptSetSearchText, abortController);
  if (!result) {
    throw new Error(`No concept found identified by '${immunizationsConceptSetSearchText}'`);
  }
  return result;
}

// TODO: Remove and and use useFormMetadata
// export function useImmunizationsConceptSet() {
//   const { immunizationsConfig } = useConfig();
//   const conceptSetSearchTerm = immunizationsConfig?.vaccinesConceptSet;
//   const [source, code] = conceptSetSearchTerm.split(':');

//   const conceptSetMappingUrl = `/ws/rest/v1/concept?source=${source}&code=${code}&v=full`;
//   const conceptSetUuidUrl = `/ws/rest/v1/concept/${conceptSetSearchTerm}?v=full`;

//   const { data, error, isLoading } = useSWR<{ data: { results: Array<OpenmrsConcept> } }, Error>(
//     isConceptMapping(conceptSetSearchTerm) ? conceptSetMappingUrl : conceptSetUuidUrl,
//     openmrsFetch,
//   );

//   return {
//     data: data ? data.data.results[0] : null,
//     isError: error,
//     isLoading,
//   };
// }

// export function useImmunizations(patientUuid: string) {
//   const immunizationsUrl = `${fhirBaseUrl}/Immunization?patient=${patientUuid}`;

//   const { data, error, isLoading, isValidating } = useSWR<{ data: FHIRImmunizationBundle }, Error>(
//     immunizationsUrl,
//     openmrsFetch,
//   );
//   const existingImmunizations = data ? mapFromFHIRImmunizationBundle(data.data) : null;

//   return {
//     data: data ? existingImmunizations : null,
//     isError: error,
//     isLoading,
//     isValidating,
//   };
// }

export function savePatientImmunization(
  patientImmunization: FHIRImmunizationResource,
  immunizationObsUuid: string,
  abortController: AbortController,
) {
  let immunizationEndpoint = `${fhirBaseUrl}/Immunization`;
  if (immunizationObsUuid) {
    immunizationEndpoint = `${immunizationEndpoint}/${immunizationObsUuid}`;
  }
  return openmrsFetch(immunizationEndpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: immunizationObsUuid ? 'PUT' : 'POST',
    body: patientImmunization,
    signal: abortController.signal,
  });
}

export function saveImmunizationEncounter(encounter, abortController: AbortController) {
  const url = `/ws/rest/v1/encounter`;
  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: encounter,
    signal: abortController.signal,
  });
}

export function saveImmunizationObs(obs, abortController) {
  const url = `/ws/rest/v1/obs/${obs.uuid}`;
  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: obs,
    signal: abortController.signal,
  });
}
