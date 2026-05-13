import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { disablePatientFlag, enablePatientFlag } from './usePatientFlags';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('usePatientFlags resource helpers', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('sends correct POST body to enable a flag', async () => {
    mockOpenmrsFetch.mockResolvedValue({ ok: true, status: 200 } as FetchResponse);

    await enablePatientFlag('flag-uuid-1');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/patientflags/patientflag/flag-uuid-1`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { voided: false },
      }),
    );
  });

  it('uses DELETE to disable a flag', async () => {
    mockOpenmrsFetch.mockResolvedValue({ ok: true, status: 204 } as FetchResponse);

    await disablePatientFlag('flag-uuid-2');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/patientflags/patientflag/flag-uuid-2`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });
});
