import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch, type OpenmrsResource } from '@openmrs/esm-framework';
import { createOrUpdateVitalsAndBiometrics, getVitalsEncounterDatetime } from './data.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const obs = [{ concept: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 37 }] as unknown as Array<OpenmrsResource>;
const openVisit = { uuid: 'open-visit-uuid', startDatetime: '2026-10-01T08:00:00.000+0000', stopDatetime: null };
const closedVisit = {
  uuid: 'closed-visit-uuid',
  startDatetime: '2026-09-20T08:00:00.000+0000',
  stopDatetime: '2026-09-20T17:00:00.000+0000',
};

describe('getVitalsEncounterDatetime', () => {
  const now = new Date('2026-10-01T10:00:00.000Z');

  it('leaves the datetime to the server when now falls inside an open visit', () => {
    expect(getVitalsEncounterDatetime(openVisit, now)).toBeUndefined();
  });

  it('clamps to the end of a closed visit', () => {
    expect(getVitalsEncounterDatetime(closedVisit, now)).toEqual(new Date('2026-09-20T17:00:00.000Z'));
  });

  it('clamps to the start of a visit that starts after now', () => {
    const futureVisit = { uuid: 'v', startDatetime: '2026-10-01T11:00:00.000+0000', stopDatetime: null };
    expect(getVitalsEncounterDatetime(futureVisit, now)).toEqual(new Date('2026-10-01T11:00:00.000Z'));
  });

  it('keeps now when it falls inside a visit that has an end', () => {
    const visit = {
      uuid: 'v',
      startDatetime: '2026-10-01T08:00:00.000+0000',
      stopDatetime: '2026-10-01T12:00:00.000+0000',
    };
    expect(getVitalsEncounterDatetime(visit, now)).toEqual(now);
  });

  it('returns undefined without a visit', () => {
    expect(getVitalsEncounterDatetime(null, now)).toBeUndefined();
  });
});

describe('createOrUpdateVitalsAndBiometrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T10:00:00.000Z'));
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as Awaited<ReturnType<typeof openmrsFetch>>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const lastBody = () => mockOpenmrsFetch.mock.calls.at(-1)[1].body as Record<string, unknown>;

  it('attaches a new encounter to the open visit and its provider, letting the server stamp the time', async () => {
    await createOrUpdateVitalsAndBiometrics('patient-uuid', 'vitals-type', null, 'opd', obs, new AbortController(), {
      visit: openVisit,
      providerUuid: 'provider-uuid',
      encounterRoleUuid: 'clinician-role',
    });

    expect(mockOpenmrsFetch.mock.calls.at(-1)[0]).toBe('/ws/rest/v1/encounter');
    expect(lastBody()).toEqual({
      patient: 'patient-uuid',
      obs,
      location: 'opd',
      encounterType: 'vitals-type',
      visit: 'open-visit-uuid',
      encounterProviders: [{ provider: 'provider-uuid', encounterRole: 'clinician-role' }],
    });
  });

  it('dates a new encounter in a closed visit inside that visit', async () => {
    await createOrUpdateVitalsAndBiometrics('patient-uuid', 'vitals-type', null, 'opd', obs, new AbortController(), {
      visit: closedVisit,
      providerUuid: 'provider-uuid',
      encounterRoleUuid: 'clinician-role',
    });

    expect(lastBody().visit).toBe('closed-visit-uuid');
    expect(lastBody().encounterDatetime).toEqual(new Date('2026-09-20T17:00:00.000Z'));
  });

  it('sends no provider when the user is not a provider or no role is configured', async () => {
    await createOrUpdateVitalsAndBiometrics('patient-uuid', 'vitals-type', null, 'opd', obs, new AbortController(), {
      visit: openVisit,
      providerUuid: undefined,
      encounterRoleUuid: 'clinician-role',
    });
    expect(lastBody()).not.toHaveProperty('encounterProviders');

    await createOrUpdateVitalsAndBiometrics('patient-uuid', 'vitals-type', null, 'opd', obs, new AbortController(), {
      visit: openVisit,
      providerUuid: 'provider-uuid',
      encounterRoleUuid: '',
    });
    expect(lastBody()).not.toHaveProperty('encounterProviders');
  });

  it('leaves the visit, datetime and providers of an edited encounter alone', async () => {
    await createOrUpdateVitalsAndBiometrics(
      'patient-uuid',
      'vitals-type',
      'encounter-uuid',
      'opd',
      obs,
      new AbortController(),
      { visit: closedVisit, providerUuid: 'provider-uuid', encounterRoleUuid: 'clinician-role' },
    );

    expect(mockOpenmrsFetch.mock.calls.at(-1)[0]).toBe('/ws/rest/v1/encounter/encounter-uuid');
    expect(lastBody()).toEqual({ patient: 'patient-uuid', obs });
  });
});
