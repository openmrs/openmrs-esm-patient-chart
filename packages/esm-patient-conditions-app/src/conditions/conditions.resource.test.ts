import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openmrsFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { getCondition, updateCondition, type FormFields } from './conditions.resource';

vi.mock('@openmrs/esm-framework', () => ({
  fhirBaseUrl: '/ws/fhir2/R4',
  restBaseUrl: '/ws/rest/v1',
  openmrsFetch: vi.fn(),
  useConfig: vi.fn(),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('updateCondition', () => {
  const dummyPayload: FormFields = {
    clinicalStatus: 'active',
    conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Hypertension',
    abatementDateTime: null,
    onsetDateTime: '2026-01-01T00:00:00Z',
    patientId: 'patient-uuid',
    userId: 'user-uuid',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends PUT request with If-Match header formatted as weak ETag when versionId is provided', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ ok: true } as any);

    await updateCondition('condition-123', dummyPayload, '1');

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Condition/condition-123`,
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': 'W/"1"',
        },
      }),
    );
  });

  it('preserves existing W/" prefix if versionId already has it', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ ok: true } as any);

    await updateCondition('condition-123', dummyPayload, 'W/"2"');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Condition/condition-123`,
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'If-Match': 'W/"2"',
        },
      }),
    );
  });

  it('sends PUT request without If-Match header when versionId is not provided', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ ok: true } as any);

    await updateCondition('condition-123', dummyPayload);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Condition/condition-123`,
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  });
});

describe('getCondition', () => {
  it('calls openmrsFetch with condition URL', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ ok: true } as any);

    await getCondition('condition-456');

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Condition/condition-456`,
      expect.objectContaining({
        signal: undefined,
      }),
    );
  });
});
