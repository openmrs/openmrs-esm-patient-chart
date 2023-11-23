import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import includes from 'lodash-es/includes';
import split from 'lodash-es/split';
import { type FHIRImmunizationBundle, type FHIRImmunizationResource, type OpenmrsConcept } from './immunization-domain';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';

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

export function useImmunizationsConceptSet() {
  const { immunizationsConfig } = useConfig();
  const conceptSetSearchTerm = immunizationsConfig?.vaccinesConceptSet;
  const [source, code] = conceptSetSearchTerm.split(':');

  const conceptSetMappingUrl = `/ws/rest/v1/concept?source=${source}&code=${code}&v=full`;
  const conceptSetUuidUrl = `/ws/rest/v1/concept/${conceptSetSearchTerm}?v=full`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<OpenmrsConcept> } }, Error>(
    isConceptMapping(conceptSetSearchTerm) ? conceptSetMappingUrl : conceptSetUuidUrl,
    openmrsFetch,
  );

  return {
    data: data ? data.data.results[0] : null,
    isError: error,
    isLoading,
  };
}

export function useImmunizations(patientUuid: string) {
  const immunizationsUrl = `${fhirBaseUrl}/Immunization?patient=${patientUuid}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: FHIRImmunizationBundle }, Error>(
    immunizationsUrl,
    openmrsFetch,
  );

  const existingImmunizations = data ? mapFromFHIRImmunizationBundle(data.data) : null;

  return {
    data: data ? existingImmunizations : null,
    isError: error,
    isLoading,
    isValidating,
  };
}

export function savePatientImmunization(
  patientImmunization: FHIRImmunizationResource,
  patientUuid: string,
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
    method: 'POST',
    body: patientImmunization,
    signal: abortController.signal,
  });
}
