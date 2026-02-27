import useSWR from 'swr';
import { type ConfigObject } from '../config-schema';
import { fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type FHIRNoteObservation } from '../types';

export const useStickyNotes = (patientUuid: string) => {
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const url = stickyNoteConceptUuid
    ? `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${stickyNoteConceptUuid}&_sort=-date`
    : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: fhir.Bundle }, Error>(url, openmrsFetch);
  return {
    notes: data?.data?.entry?.map((entry) => entry.resource) || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const createStickyNote = (patientUuid: string, note: string, stickyNoteConceptUuid: string) => {
  const stickyNotePayload: FHIRNoteObservation = {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [
        {
          code: stickyNoteConceptUuid,
        },
      ],
    },
    subject: {
      reference: `Patient/${patientUuid}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueString: note,
  };

  return openmrsFetch(`${fhirBaseUrl}/Observation`, {
    method: 'POST',
    body: stickyNotePayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateStickyNote = (
  stickyNoteUuid: string,
  note: string,
  stickyNoteConceptUuid: string,
  patientUuid: string,
) => {
  const stickyNotePayload: FHIRNoteObservation = {
    resourceType: 'Observation',
    id: stickyNoteUuid,
    status: 'final',
    code: {
      coding: [
        {
          code: stickyNoteConceptUuid,
        },
      ],
    },
    subject: {
      reference: `Patient/${patientUuid}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueString: note,
  };

  return openmrsFetch(`${fhirBaseUrl}/Observation/${stickyNoteUuid}`, {
    method: 'PUT',
    body: stickyNotePayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const deleteStickyNote = (stickyNoteUuid: string) => {
  return openmrsFetch(`${fhirBaseUrl}/Observation/${stickyNoteUuid}`, {
    method: 'DELETE',
  });
};
