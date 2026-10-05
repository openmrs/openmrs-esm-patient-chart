import { afterEach, describe, expect, it, vi } from 'vitest';
import { addUserDataToCache, getUserDataFromCache, loadObsEntries } from './helpers';

describe('Laboratory observation requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([401, 403, 500])('rejects an HTTP %i response instead of returning an empty result list', async (status) => {
    const json = vi.fn().mockResolvedValue({ resourceType: 'OperationOutcome' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, statusText: '', json }));

    await expect(loadObsEntries('patient-with-failed-request')).rejects.toThrow(
      `Failed to fetch laboratory observations: ${status}`,
    );
    expect(json).not.toHaveBeenCalled();
  });

  it('rejects when a later page fails instead of returning partial results', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 301, entry: [{ resource: { id: 'first-observation' } }] }),
      })
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable', json: async () => ({}) });
    vi.stubGlobal('fetch', fetch);

    await expect(loadObsEntries('patient-with-failed-page')).rejects.toThrow(
      'Failed to fetch laboratory observations: 503 Service Unavailable',
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toContain('_getpagesoffset=300');
  });

  it('returns observations from all successful pages in order', async () => {
    const first = { id: 'first-observation' };
    const second = { id: 'second-observation' };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ total: 301, entry: [{ resource: first }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ total: 301, entry: [{ resource: second }] }) }),
    );

    await expect(loadObsEntries('patient-with-successful-pages')).resolves.toEqual([first, second]);
  });

  it('returns an empty list for a successful empty bundle', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ total: 0 }) }));

    await expect(loadObsEntries('patient-with-no-observations')).resolves.toEqual([]);
  });

  it('preserves network failures', async () => {
    const error = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(loadObsEntries('patient-with-network-error')).rejects.toBe(error);
  });

  it.each([
    ['cached-observation', false],
    ['new-observation', true],
  ])('checks a successful cache indicator response with observation %s', async (id, expectedReload) => {
    const patientUuid = `patient-with-indicator-${id}`;
    addUserDataToCache(patientUuid, {}, 'cached-observation');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ entry: [{ resource: { id } }] }),
      }),
    );

    const [, shouldReload] = getUserDataFromCache(patientUuid);

    await expect(shouldReload).resolves.toBe(expectedReload);
  });

  it('propagates HTTP failures when checking the cached observation indicator', async () => {
    const patientUuid = 'patient-with-cached-observations';
    const data = {};
    addUserDataToCache(patientUuid, data, 'cached-observation');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      }),
    );

    const [cachedData, shouldReload] = getUserDataFromCache(patientUuid);

    expect(cachedData).toBe(data);
    await expect(shouldReload).rejects.toThrow('Failed to fetch laboratory observations: 500 Internal Server Error');
  });
});
