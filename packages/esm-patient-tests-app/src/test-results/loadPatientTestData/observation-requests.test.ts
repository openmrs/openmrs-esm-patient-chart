import { afterEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import { addUserDataToCache, getUserDataFromCache, loadObsEntries } from './helpers';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('Laboratory observation requests', () => {
  afterEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it.each([401, 403, 500])('propagates an HTTP %i failure instead of returning an empty result list', async (status) => {
    const error = Object.assign(new Error(`Request failed with status ${status}`), {
      response: { status, statusText: '' },
    });
    mockOpenmrsFetch.mockRejectedValue(error as any);

    await expect(loadObsEntries('patient-with-failed-request')).rejects.toBe(error);
  });

  it('rejects when a later page fails instead of returning partial results', async () => {
    const error = Object.assign(new Error('Service Unavailable'), {
      response: { status: 503, statusText: 'Service Unavailable' },
    });
    mockOpenmrsFetch
      .mockResolvedValueOnce({
        data: { total: 301, entry: [{ resource: { id: 'first-observation' } }] },
      } as any)
      .mockRejectedValueOnce(error as any);

    await expect(loadObsEntries('patient-with-failed-page')).rejects.toBe(error);
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
    expect(mockOpenmrsFetch.mock.calls[1][0]).toContain('_getpagesoffset=300');
  });

  it('returns observations from all successful pages in order', async () => {
    const first = { id: 'first-observation' };
    const second = { id: 'second-observation' };
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { total: 301, entry: [{ resource: first }] } } as any)
      .mockResolvedValueOnce({ data: { total: 301, entry: [{ resource: second }] } } as any);

    await expect(loadObsEntries('patient-with-successful-pages')).resolves.toEqual([first, second]);
  });

  it('returns an empty list for a successful empty bundle', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: { total: 0 } } as any);

    await expect(loadObsEntries('patient-with-no-observations')).resolves.toEqual([]);
  });

  it('preserves network failures', async () => {
    const error = new TypeError('Failed to fetch');
    mockOpenmrsFetch.mockRejectedValue(error);

    await expect(loadObsEntries('patient-with-network-error')).rejects.toBe(error);
  });

  it.each([
    ['cached-observation', false],
    ['new-observation', true],
  ])('checks a successful cache indicator response with observation %s', async (id, expectedReload) => {
    const patientUuid = `patient-with-indicator-${id}`;
    addUserDataToCache(patientUuid, {}, 'cached-observation');
    mockOpenmrsFetch.mockResolvedValue({
      data: { entry: [{ resource: { id } }] },
    } as any);

    const [, shouldReload] = getUserDataFromCache(patientUuid);

    await expect(shouldReload).resolves.toBe(expectedReload);
  });

  it('propagates HTTP failures when checking the cached observation indicator', async () => {
    const patientUuid = 'patient-with-cached-observations';
    const data = {};
    const error = Object.assign(new Error('Internal Server Error'), {
      response: { status: 500, statusText: 'Internal Server Error' },
    });
    addUserDataToCache(patientUuid, data, 'cached-observation');
    mockOpenmrsFetch.mockRejectedValue(error as any);

    const [cachedData, shouldReload] = getUserDataFromCache(patientUuid);

    expect(cachedData).toBe(data);
    await expect(shouldReload).rejects.toBe(error);
  });
});
