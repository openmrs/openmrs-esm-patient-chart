import { renderHook } from '@testing-library/react';
import { useAllEncounters, isCompletedFormEncounter } from './encounters-table.resource';

const mockUseOpenmrsFetchAll = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  makeUrl: jest.fn((path: string) => `http://localhost/${path}`),
  restBaseUrl: '/ws/rest/v1',
  useOpenmrsFetchAll: (...args) => mockUseOpenmrsFetchAll(...args),
}));

describe('isCompletedFormEncounter', () => {
  it('returns true when encounter has form with JSON schema resource', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: {
        uuid: 'form-1',
        display: 'Test Form',
        resources: [{ name: 'JSON schema', valueReference: '{}' }],
      },
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(true);
  });

  it('returns false when encounter has no form', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: null,
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(false);
  });

  it('returns false when form is undefined', () => {
    const encounter = {
      uuid: 'encounter-1',
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(false);
  });

  it('returns false when form has no resources array', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: {
        uuid: 'form-1',
        display: 'Test Form',
      },
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(false);
  });

  it('returns false when form has empty resources array', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: {
        uuid: 'form-1',
        display: 'Test Form',
        resources: [],
      },
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(false);
  });

  it('returns false when resources do not contain JSON schema', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: {
        uuid: 'form-1',
        display: 'Test Form',
        resources: [{ name: 'Some other resource', valueReference: '{}' }],
      },
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(false);
  });

  it('returns true when resources contain multiple items including JSON schema', () => {
    const encounter = {
      uuid: 'encounter-1',
      form: {
        uuid: 'form-1',
        display: 'Test Form',
        resources: [
          { name: 'XML template', valueReference: '<xml/>' },
          { name: 'JSON schema', valueReference: '{}' },
          { name: 'Metadata', valueReference: 'meta' },
        ],
      },
    } as any;

    expect(isCompletedFormEncounter(encounter)).toBe(true);
  });
});

describe('useAllEncounters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useOpenmrsFetchAll with correct URL when patientUuid is provided', () => {
    const mockData = [
      { uuid: 'enc-1', display: 'Encounter 1' },
      { uuid: 'enc-2', display: 'Encounter 2' },
    ];

    mockUseOpenmrsFetchAll.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: undefined,
    } as any);

    renderHook(() => useAllEncounters('patient-123'));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalled();
    const callArg = mockUseOpenmrsFetchAll.mock.calls[0][0];
    expect(callArg).toContain('patient=patient-123');
    expect(callArg).toContain('order=desc');
  });

  it('passes encounterType filter to the URL when provided', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderHook(() => useAllEncounters('patient-123', 'encounter-type-uuid'));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalled();
    const callArg = mockUseOpenmrsFetchAll.mock.calls[0][0];
    expect(callArg).toContain('encounterType=encounter-type-uuid');
  });

  it('includes custom representation in the URL', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderHook(() => useAllEncounters('patient-123'));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalled();
    const callArg = mockUseOpenmrsFetchAll.mock.calls[0][0];
    expect(callArg).toContain('v=custom');
    expect(callArg).toContain('encounterDatetime');
    expect(callArg).toContain('form');
    expect(callArg).toContain('obs');
    expect(callArg).toContain('encounterProviders');
  });
});
