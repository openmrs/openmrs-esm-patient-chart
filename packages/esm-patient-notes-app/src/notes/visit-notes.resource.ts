import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, restBaseUrl, useAttachments, useConfig } from '@openmrs/esm-framework';
import { getAttachmentBytesUrl } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import type {
  Concept,
  DiagnosisPayload,
  EncountersFetchResponse,
  PatientNote,
  RESTPatientNote,
  VisitNotePayload,
} from '../types';

export interface SavedVisitNoteImage {
  id: string;
  src: string;
  description?: string;
  filename?: string;
}

/**
 * The images already recorded on a visit note's encounter. Nothing is fetched until an
 * encounter UUID is known, so the create form makes no request.
 */
export function useVisitNoteImages(patientUuid: string, encounterUuid?: string) {
  const { data, isLoading, error } = useAttachments(encounterUuid ? patientUuid : null, false, encounterUuid);

  const images = useMemo<Array<SavedVisitNoteImage>>(
    () =>
      data
        .filter((attachment) => attachment.bytesContentFamily === 'IMAGE')
        .map((attachment) => ({
          id: attachment.uuid,
          src: getAttachmentBytesUrl(attachment.uuid),
          description: attachment.comment,
          filename: attachment.filename,
        })),
    [data],
  );

  return { images, isLoading, error };
}

interface UseVisitNotes {
  visitNotes: Array<PatientNote> | null;
  error: Error;
  isLoading: boolean;
  isValidating?: boolean;
  mutateVisitNotes: () => void;
}

export function useVisitNotes(patientUuid: string): UseVisitNotes {
  const {
    visitNoteConfig: { encounterNoteTextConceptUuid, visitDiagnosesConceptUuid },
  } = useConfig<ConfigObject>();

  const customRepresentation =
    'custom:(uuid,display,encounterDatetime,patient,obs,' +
    'encounterProviders:(uuid,display,' +
    'encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display))),' +
    'diagnoses';
  const encountersApiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&obs=${visitDiagnosesConceptUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: EncountersFetchResponse }, Error>(
    encountersApiUrl,
    openmrsFetch,
  );

  const mapNoteProperties = (note: RESTPatientNote, index: number): PatientNote => ({
    id: `${index}`,
    diagnoses: note.diagnoses
      .filter((diagnosis) => !diagnosis.voided)
      .map((diagnosisData) => diagnosisData.display)
      .filter((val) => val)
      .join(', '),
    encounterDate: note.encounterDatetime,
    encounterNote: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)?.value,
    encounterNoteRecordedAt: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)
      ?.obsDatetime,
    encounterProvider: note?.encounterProviders[0]?.provider?.person?.display,
    encounterProviderRole: note?.encounterProviders[0]?.encounterRole?.display,
  });

  const formattedVisitNotes = data?.data?.results
    ?.map(mapNoteProperties)
    ?.sort((noteA, noteB) => new Date(noteB.encounterDate).getTime() - new Date(noteA.encounterDate).getTime());

  return {
    visitNotes: data ? formattedVisitNotes : null,
    error,
    isLoading,
    isValidating,
    mutateVisitNotes: mutate,
  };
}

export function fetchDiagnosisConceptsByName(searchTerm: string, diagnosisConceptClass: string) {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `${restBaseUrl}/concept?name=${searchTerm}&searchType=fuzzy&class=${diagnosisConceptClass}&v=${customRepresentation}`;

  return openmrsFetch<Array<Concept>>(url).then(({ data }) => Promise.resolve(data['results']));
}

export function saveVisitNote(abortController: AbortController, payload: VisitNotePayload) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function updateVisitNote(abortController: AbortController, encounterUuid: string, payload: VisitNotePayload) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

/**
 * Makes the given provider the encounter's only active provider for the role. Posting `encounterProviders` to
 * an existing encounter only ever adds providers, so the previous ones are voided separately.
 */
export async function replaceEncounterClinician(
  abortController: AbortController,
  encounterUuid: string,
  providerUuid: string,
  encounterRoleUuid: string,
) {
  const encounterProvidersUrl = `${restBaseUrl}/encounter/${encounterUuid}/encounterprovider`;
  const { data } = await openmrsFetch<{
    results: Array<{ uuid: string; provider: { uuid: string }; encounterRole: { uuid: string } }>;
  }>(`${encounterProvidersUrl}?v=custom:(uuid,provider:(uuid),encounterRole:(uuid))`, {
    signal: abortController.signal,
  });
  const providersToVoid = data.results.filter(
    (encounterProvider) =>
      encounterProvider.encounterRole?.uuid === encounterRoleUuid && encounterProvider.provider?.uuid !== providerUuid,
  );

  // Add before voiding, so a failure part way never leaves the encounter without a clinician
  await openmrsFetch(encounterProvidersUrl, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: { provider: providerUuid, encounterRole: encounterRoleUuid },
    signal: abortController.signal,
  });
  for (const encounterProvider of providersToVoid) {
    await openmrsFetch(`${encounterProvidersUrl}/${encounterProvider.uuid}`, {
      method: 'DELETE',
      signal: abortController.signal,
    });
  }
}

export function savePatientDiagnosis(abortController: AbortController, payload: DiagnosisPayload) {
  return openmrsFetch(`${restBaseUrl}/patientdiagnoses`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function deletePatientDiagnosis(abortController: AbortController, diagnosisUuid: string) {
  return openmrsFetch(`${restBaseUrl}/patientdiagnoses/${diagnosisUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

/** Void only the image obs. The attachment DELETE endpoint can also void its encounter. */
export function removeVisitNoteImage(imageUuid: string) {
  return openmrsFetch(`${restBaseUrl}/obs/${imageUuid}?reason=Removed%20from%20visit%20note`, { method: 'DELETE' });
}
