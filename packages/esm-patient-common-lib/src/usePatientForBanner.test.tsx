import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePatient } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { usePatientForBanner } from './usePatientForBanner';

const mockUsePatient = vi.mocked(usePatient);

describe('usePatientForBanner', () => {
  beforeEach(() => {
    mockUsePatient.mockReset();
    mockUsePatient.mockReturnValue({ patient: null, patientUuid: null, isLoading: false, error: null });
  });

  it('does not fetch when the supplied patient already has banner data', () => {
    const { result } = renderHook(() => usePatientForBanner(mockPatient));

    expect(mockUsePatient).toHaveBeenCalledWith('');
    expect(result.current).toBe(mockPatient);
  });

  it('fetches the full patient when the supplied patient is partial', () => {
    const partialPatient = { id: mockPatient.id, birthDate: mockPatient.birthDate } as fhir.Patient;
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePatientForBanner(partialPatient));

    expect(mockUsePatient).toHaveBeenCalledWith(mockPatient.id);
    expect(result.current).toBe(mockPatient);
  });

  it('fetches the patient by UUID when no patient is supplied', () => {
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePatientForBanner(undefined, mockPatient.id));

    expect(mockUsePatient).toHaveBeenCalledWith(mockPatient.id);
    expect(result.current).toBe(mockPatient);
  });
});
