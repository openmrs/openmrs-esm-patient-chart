import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import { getEncounterClinician, replaceEncounterClinician } from './encounter-clinician';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('getEncounterClinician', () => {
  const nurse = { encounterRole: { uuid: 'nurse-role' }, provider: { uuid: 'nurse', display: 'Nurse' } };
  const clinician = {
    encounterRole: { uuid: 'clinician-role' },
    provider: { uuid: 'clinician', display: 'Clinician', person: { display: 'Dr Clinician' } },
  };

  it('returns the provider with the clinician encounter role, whatever the order', () => {
    expect(getEncounterClinician([clinician, nurse], 'clinician-role')).toEqual({
      uuid: 'clinician',
      person: { display: 'Dr Clinician' },
    });
    expect(getEncounterClinician([nurse, clinician], 'clinician-role')?.uuid).toBe('clinician');
  });

  it('falls back to the first provider when none has the role', () => {
    expect(getEncounterClinician([nurse], 'clinician-role')).toEqual({ uuid: 'nurse', person: { display: 'Nurse' } });
  });

  it('returns null when there are no providers', () => {
    expect(getEncounterClinician(undefined, 'clinician-role')).toBeNull();
    expect(getEncounterClinician([], 'clinician-role')).toBeNull();
  });
});

describe('replaceEncounterClinician', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('replaces the clinician by adding the new one and voiding the other clinicians of the same role', async () => {
    const abortController = new AbortController();
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: {
        results: [
          { uuid: 'ep-old', provider: { uuid: 'old-provider' }, encounterRole: { uuid: 'clinician-role' } },
          { uuid: 'ep-other-role', provider: { uuid: 'old-provider' }, encounterRole: { uuid: 'nurse-role' } },
          { uuid: 'ep-new', provider: { uuid: 'new-provider' }, encounterRole: { uuid: 'clinician-role' } },
        ],
      },
    } as Awaited<ReturnType<typeof openmrsFetch>>);
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as Awaited<ReturnType<typeof openmrsFetch>>);

    await replaceEncounterClinician(abortController, 'enc-uuid', 'new-provider', 'clinician-role');

    const calls = mockOpenmrsFetch.mock.calls.map(([url, options]) => [url, (options as RequestInit)?.method]);
    expect(calls).toEqual([
      [expect.stringContaining('/encounter/enc-uuid/encounterprovider?v='), undefined],
      [expect.stringMatching(/\/encounter\/enc-uuid\/encounterprovider$/), 'POST'],
      [expect.stringMatching(/\/encounter\/enc-uuid\/encounterprovider\/ep-old$/), 'DELETE'],
    ]);
    expect(mockOpenmrsFetch.mock.calls[1][1]).toMatchObject({
      body: { provider: 'new-provider', encounterRole: 'clinician-role' },
    });
  });
});
