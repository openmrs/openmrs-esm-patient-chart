import { afterEach, describe, expect, it, vi } from 'vitest';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { markPatientDeceased } from './data.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('markPatientDeceased', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends a past death date as a date without a time or timezone', async () => {
    mockOpenmrsFetch.mockResolvedValue({} as FetchResponse);

    await markPatientDeceased(new Date(1972, 3, 4), 'person-uuid', 'cause-of-death-uuid');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/person/person-uuid`,
      expect.objectContaining({
        method: 'POST',
        body: { dead: true, deathDate: '1972-04-04', causeOfDeath: 'cause-of-death-uuid' },
      }),
    );
  });

  it('sends a death date of today as the current time', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 1, 1, 0));
    mockOpenmrsFetch.mockResolvedValue({} as FetchResponse);

    await markPatientDeceased(new Date(2026, 9, 1), 'person-uuid', 'cause-of-death-uuid');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/person/person-uuid`,
      expect.objectContaining({
        method: 'POST',
        body: {
          dead: true,
          deathDate: new Date(2026, 9, 1, 1, 0).toISOString(),
          causeOfDeath: 'cause-of-death-uuid',
        },
      }),
    );
  });
});
