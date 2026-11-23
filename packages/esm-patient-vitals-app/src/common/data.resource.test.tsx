import React from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  fhirBaseUrl,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  useConfig,
  useFhirFetchAll,
} from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import { invalidateCachedVitalsAndBiometrics, useVitalsAndBiometrics } from './data.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);

const config = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
const { pulseUuid, generalPatientNoteUuid } = config.concepts;
const notesUrl = `${fhirBaseUrl}/Observation?subject:Patient=${mockPatient.id}&code=${generalPatientNoteUuid}&_sort=-date&_count=100`;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

// One more vitals entry with a note than the FHIR server returns on a single page by default (10).
const encounterIds = Array.from({ length: 11 }, (_, index) => `encounter-${index + 1}`);

function pulseObservation(encounterId: string, index: number) {
  return {
    resourceType: 'Observation',
    id: `pulse-${encounterId}`,
    code: { coding: [{ code: pulseUuid, display: 'Pulse' }], text: 'Pulse' },
    encounter: { reference: `Encounter/${encounterId}`, type: 'Encounter' },
    effectiveDateTime: `2026-11-${String(index + 1).padStart(2, '0')}T10:00:00+00:00`,
    valueQuantity: { value: 70 + index, unit: 'beats/min', system: 'http://unitsofmeasure.org', code: '/min' },
    referenceRange: [],
  };
}

function noteObservation(encounterId: string, text: string) {
  return {
    resourceType: 'Observation',
    id: `note-${encounterId}`,
    code: { coding: [{ code: generalPatientNoteUuid, display: 'General patient note' }], text: 'General patient note' },
    encounter: { reference: `Encounter/${encounterId}`, type: 'Encounter' },
    valueString: text,
  };
}

const mockMutateNotes = vi.fn().mockResolvedValue(undefined);

function mockNotes(notes: Array<ReturnType<typeof noteObservation> | undefined> | undefined) {
  mockUseFhirFetchAll.mockReturnValue({ data: notes, mutate: mockMutateNotes } as unknown as ReturnType<
    typeof useFhirFetchAll
  >);
}

const vitalsBundle = {
  resourceType: 'Bundle',
  total: encounterIds.length,
  link: [{ relation: 'self', url: '' }],
  entry: encounterIds.map((encounterId, index) => ({ resource: pulseObservation(encounterId, index) })),
};

describe('useVitalsAndBiometrics', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(config);
    mockOpenmrsFetch.mockImplementation((url: string) => {
      if (url.includes('conceptreferencerange')) {
        return Promise.resolve({ data: { results: [] } } as Awaited<ReturnType<typeof openmrsFetch>>);
      }
      return Promise.resolve({ data: vitalsBundle } as Awaited<ReturnType<typeof openmrsFetch>>);
    });
  });

  it('fetches every page of notes for the patient', () => {
    mockNotes([]);

    renderHook(() => useVitalsAndBiometrics(mockPatient.id, 'vitals'), { wrapper });

    expect(mockUseFhirFetchAll).toHaveBeenCalledWith(notesUrl);
  });

  it('attaches a note to every vitals entry, including notes beyond the first page', async () => {
    const notes = encounterIds.map((encounterId, index) => noteObservation(encounterId, `Note ${index + 1}`));
    mockNotes(notes);

    const { result } = renderHook(() => useVitalsAndBiometrics(mockPatient.id, 'vitals'), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(11));
    encounterIds.forEach((encounterId, index) => {
      expect(result.current.data.find((row) => row.id === encounterId)?.note).toBe(`Note ${index + 1}`);
    });
  });

  it('shows vitals entries without notes when the patient has no notes', async () => {
    // A FHIR bundle with no results has no `entry` field, which useFhirFetchAll returns as `[undefined]`.
    mockNotes([undefined]);

    const { result } = renderHook(() => useVitalsAndBiometrics(mockPatient.id, 'vitals'), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(11));
    expect(result.current.data.every((row) => row.note === undefined)).toBe(true);
  });

  it('does not add an entry for an encounter that only has a note', async () => {
    mockNotes([
      noteObservation('encounter-1', 'Note 1'),
      noteObservation('note-only-encounter', 'Note without vitals'),
    ]);

    const { result } = renderHook(() => useVitalsAndBiometrics(mockPatient.id, 'vitals'), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(11));
    expect(result.current.data.find((row) => row.id === 'encounter-1')?.note).toBe('Note 1');
    expect(result.current.data.some((row) => row.id === 'note-only-encounter')).toBe(false);
  });

  it('reloads notes as well as vitals after vitals are saved or deleted', async () => {
    mockNotes([]);

    const { result } = renderHook(() => useVitalsAndBiometrics(mockPatient.id, 'vitals'), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(11));
    mockOpenmrsFetch.mockClear();
    mockMutateNotes.mockClear();

    await invalidateCachedVitalsAndBiometrics();

    expect(mockMutateNotes).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledWith(expect.stringContaining('_count=100')));
  });

  it('does not fetch notes without a patient', () => {
    mockNotes(undefined);

    renderHook(() => useVitalsAndBiometrics(undefined, 'vitals'), { wrapper });

    expect(mockUseFhirFetchAll).toHaveBeenCalledWith(null);
  });
});
