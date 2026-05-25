import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import type { ConceptSourceType } from './config-schema';
import type { ConceptReference, ProcedureApiResponse, ProcedureTypeApiResponse, RawProcedure, } from './types';

export type ConceptSource = { uuid: string; sourceType: ConceptSourceType };

const sourceTypeToRestParam: Record<Exclude<ConceptSourceType, 'any'>, string> = {
  'Concept class': 'class',
  'Concept set': 'memberOf',
  'Answer to': 'answerTo',
};

const buildConceptSearchUrl = (query: string, source: ConceptSource): string => {
  const params = new URLSearchParams({ v: 'custom:(uuid,display)' });
  if (query) {
    params.set('name', query);
    params.set('searchType', 'fuzzy');
  }
  if (source.uuid && source.sourceType !== 'any') {
    params.set(sourceTypeToRestParam[source.sourceType], source.uuid);
  }
  return `${restBaseUrl}/concept?${params.toString()}`;
};

export const useProcedureTypes = () => {
  const url = `${restBaseUrl}/proceduretype?v=full`;
  const { data, isLoading } = useSWR<{ data: ProcedureTypeApiResponse }, Error>(url, openmrsFetch);
  return { procedureTypes: data?.data?.results ?? [], isLoading };
};

export const useConceptSearch = (query: string, source: ConceptSource) => {
  const hasSourceFilter = Boolean(source.uuid) && source.sourceType !== 'any';
  const url = query || hasSourceFilter ? buildConceptSearchUrl(query, source) : null;
  const { data, isLoading } = useSWR<{ data: { results: ConceptReference[] } }, Error>(url, openmrsFetch);

  const results = data?.data?.results ?? [];

  // TODO: RESTWS-1035: Currently the API returns duplicated results, remove the following once the bug is fixed
  const uniqueSearchResults = Array.from(new Map(results.map((concept) => [concept.uuid, concept])).values());

  return { searchResults: uniqueSearchResults, isSearching: isLoading };
};

export const saveProcedure = async (payload: RawProcedure) => {
  return openmrsFetch(`${restBaseUrl}/procedure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
};

export const updateProcedure = async (procedureUuid: string, payload: RawProcedure) => {
  return openmrsFetch(`${restBaseUrl}/procedure/${procedureUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
};

export const useMutatePatientProcedures = (patientUuid: string) => {
  const { mutate } = useSWRConfig();
  return () =>
    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/procedure?patient=${patientUuid}`));
};

export const useProcedures = (patientUuid: string, startIndex = 0, limit = 100) => {
  const url = `${restBaseUrl}/procedure?patient=${patientUuid}&v=full&startIndex=${startIndex}&limit=${limit}&totalCount=true`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: ProcedureApiResponse }, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );
  return {
    procedures: data ? data.data?.results ?? [] : null,
    totalCount: data?.data?.totalCount ?? 0,
    error,
    isLoading,
    isValidating,
  };
};

export const deleteProcedure = async (procedureId: string) => {
  return await openmrsFetch(`${restBaseUrl}/procedure/${procedureId}`, {
    method: 'DELETE',
  });
};

export const useConceptById = (uuid: string) => {
  const url = uuid ? `${restBaseUrl}/concept/${uuid}?v=custom:(uuid,display)` : null;
  const { data } = useSWR<{ data: ConceptReference }, Error>(url, openmrsFetch);
  return data?.data ?? null;
};

export const useConceptSearchField = (source: ConceptSource) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConceptSearch(debouncedSearchTerm, source);
  const clear = () => setSearchTerm('');
  return { searchTerm, setSearchTerm, searchResults, isSearching, clear };
};
