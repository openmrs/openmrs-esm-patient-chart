import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Procedure, type ProcedureObservation, type UseProcedures } from '../types';

export function useProcedures(patientUuid: string): UseProcedures {
  const config = useConfig<ConfigObject>();

  // Real API implementation
  const proceduresUrl = `${restBaseUrl}/obs?patient=${patientUuid}&concept=${config.procedureConceptUuid}&v=full`;

  const fetcher = (url: string) =>
    openmrsFetch<{ results: ProcedureObservation[] }>(url).then((res) => {
      return { results: res.data.results || [] };
    });

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ results: ProcedureObservation[] }, Error>(
    patientUuid && config.procedureConceptUuid ? proceduresUrl : null,
    fetcher,
  );

  const formattedProcedures =
    data?.results && data.results.length > 0
      ? data.results.map(mapProcedureProperties).sort((a, b) => (b.date > a.date ? 1 : -1))
      : [];

  return {
    procedures: formattedProcedures,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

function mapProcedureProperties(obs: ProcedureObservation): Procedure {
  const procedureDate = obs.valueDatetime || obs.obsDatetime;
  const year = new Date(procedureDate).getFullYear().toString();

  return {
    id: obs.uuid,
    procedureName: obs.concept.display,
    date: procedureDate,
    year: year,
    status: obs.value || 'Completed',
    recordedDate: obs.obsDatetime,
    recordedBy: obs.person.display,
    note: obs.comment,
  };
}

export interface SaveProcedurePayload {
  concept: string;
  person: string;
  obsDatetime: string;
  valueDatetime?: string;
  value?: string;
  comment?: string;
}

export function saveProcedure(payload: SaveProcedurePayload, patientUuid: string, abortController: AbortController) {
  // Fail fast if patientUuid is missing
  if (!patientUuid) {
    throw new Error('Patient UUID is required');
  }

  return openmrsFetch(`${restBaseUrl}/obs`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      ...payload,
      person: patientUuid,
    },
    signal: abortController.signal,
  }).catch((error) => {
    if (error.responseBody) {
      console.error('Validation error:', error.responseBody);
    } else {
      console.error('Save procedure error:', error);
    }
    throw error;
  });
}

export function deleteProcedure(obsUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
