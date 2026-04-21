import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';

const stickyNoteRepresentation = 'custom:(uuid,value,obsDatetime,auditInfo:(creator:(display)))';

export interface StickyNoteObs {
  uuid: string;
  value: string;
  obsDatetime: string;
  auditInfo?: {
    creator?: {
      display?: string;
    };
  };
}

interface StickyNoteResponse {
  results: Array<StickyNoteObs>;
}

export const useStickyNote = (patientUuid: string) => {
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const url =
    patientUuid && stickyNoteConceptUuid
      ? `${restBaseUrl}/obs?patient=${patientUuid}&concept=${stickyNoteConceptUuid}&v=${stickyNoteRepresentation}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: StickyNoteResponse }, Error>(url, openmrsFetch);

  const note = useMemo(
    () =>
      data?.data?.results
        ?.slice()
        .sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime())[0],
    [data?.data?.results],
  );

  return {
    note,
    isLoading,
    error,
    mutate,
  };
};

export const createStickyNote = (patientUuid: string, value: string, conceptUuid: string) => {
  return openmrsFetch(`${restBaseUrl}/obs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person: patientUuid,
      concept: conceptUuid,
      value,
      obsDatetime: new Date().toISOString(),
    }),
  });
};

export const updateStickyNote = (obsUuid: string, value: string) => {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
};

export const deleteStickyNote = (obsUuid: string) => {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    method: 'DELETE',
  });
};
