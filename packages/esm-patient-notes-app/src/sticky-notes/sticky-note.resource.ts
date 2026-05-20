import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';

const stickyNoteRepresentation =
  'custom:(uuid,value,obsDatetime,encounter:(uuid),formNamespaceAndPath,auditInfo:(creator:(display)))';

export interface StickyNoteObs {
  uuid: string;
  value: string;
  obsDatetime: string;
  encounter?: { uuid: string } | null;
  formNamespaceAndPath?: string | null;
  auditInfo?: {
    creator?: {
      display?: string;
    };
  };
}

interface StickyNoteResponse {
  results: Array<StickyNoteObs>;
}

// Exclude obs attached to an encounter or created by a form engine. The sticky-note UI only
// writes standalone obs, so this guards against another feature (e.g. the visit note) writing
// to the same concept UUID.
export const isStandaloneStickyNote = (obs: StickyNoteObs) => !obs.encounter && !obs.formNamespaceAndPath;

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
        ?.filter(isStandaloneStickyNote)
        .slice()
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
