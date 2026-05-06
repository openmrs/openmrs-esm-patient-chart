import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import {
  type ConceptReference,
  type ProcedureApiResponse,
  type ProcedureTypeApiResponse,
  type RawProcedure,
} from '../types';

export function useProcedureTypes() {
  const url = `${restBaseUrl}/proceduretype?v=full`;
  const { data, error, isLoading } = useSWR<{ data: ProcedureTypeApiResponse }, Error>(url, openmrsFetch);
  return { procedureTypes: data?.data?.results ?? [], isLoading };
}

export function useConceptSearch(query: string, conceptClassUuid: string) {
  const classParam = conceptClassUuid ? `&class=${conceptClassUuid}` : '';
  const url = `${restBaseUrl}/concept?name=${query}&searchType=fuzzy${classParam}&v=custom:(uuid,display)`;
  const { data, error, isLoading } = useSWR<{ data: { results: ConceptReference[] } }, Error>(
    query ? url : null,
    openmrsFetch,
  );
  return { searchResults: data?.data?.results ?? [], isSearching: isLoading };
}

export async function saveProcedure(payload: RawProcedure) {
  return openmrsFetch(`${restBaseUrl}/procedure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

export async function updateProcedure(procedureUuid: string, payload: RawProcedure) {
  return openmrsFetch(`${restBaseUrl}/procedure/${procedureUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

export function useMutatePatientProcedures(patientUuid: string) {
  const { mutate } = useSWRConfig();
  return () =>
    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/procedure?patient=${patientUuid}`));
}

export function useProcedures(patientUuid: string) {
  const url = `${restBaseUrl}/procedure?patient=${patientUuid}&v=full&limit=100`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: ProcedureApiResponse }, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );
  return { procedures: data ? (data.data?.results ?? []) : null, error, isLoading, isValidating };
}

export async function deleteProcedure(procedureId: string) {
  const controller = new AbortController();
  const url = `${restBaseUrl}/procedure/${procedureId}`;

  return await openmrsFetch(url, {
    method: 'DELETE',
    signal: controller.signal,
  });
}

export function useConceptById(uuid: string) {
  const url = uuid ? `${restBaseUrl}/concept/${uuid}?v=custom:(uuid,display)` : null;
  const { data } = useSWR<{ data: ConceptReference }, Error>(url, openmrsFetch);
  return data?.data ?? null;
}

export function useConceptSearchField(conceptClassUuid: string, initialValue: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<ConceptReference | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm);

  const { searchResults, isSearching } = useConceptSearch(debouncedSearchTerm, conceptClassUuid);

  const initialConceptData = useConceptById(initialValue);

  useEffect(() => {
    if (initialConceptData) {
      setSelectedConcept(initialConceptData);
    }
  }, [initialConceptData]);

  const clear = () => {
    setSearchTerm('');
    setSelectedConcept(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedConcept,
    setSelectedConcept,
    searchResults,
    isSearching,
    clear,
  };
}
