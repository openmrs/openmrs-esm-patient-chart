import { useSWRConfig } from 'swr';
import { renderHook, act } from '@testing-library/react';
import { showSnackbar, type Visit } from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { useDeleteVisit } from './useDeleteVisit';
import { deleteVisit, restoreVisit } from '../visits-widget/visit.resource';

jest.mock('swr', () => ({
  useSWRConfig: jest.fn(),
}));

jest.mock('../visits-widget/visit.resource', () => {
  const original = jest.requireActual('../visits-widget/visit.resource');
  return {
    ...original,
    deleteVisit: jest.fn(),
    restoreVisit: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  invalidateVisitAndEncounterData: jest.fn(),
  usePatientChartStore: jest.fn(),
}));

const mockDeleteVisit = jest.mocked(deleteVisit);
const mockRestoreVisit = jest.mocked(restoreVisit);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseSWRConfig = jest.mocked(useSWRConfig);
const mockUsePatientChartStore = jest.mocked(usePatientChartStore);
const mockInvalidateVisitAndEncounterData = jest.mocked(invalidateVisitAndEncounterData);

const mockGlobalMutate = jest.fn();
const mockSetVisitContext = jest.fn();

const mockVisitType = {
  uuid: 'visit-type-123',
  display: 'Outpatient Visit',
  name: 'Outpatient Visit',
};

const mockVisit = {
  uuid: 'visit-123',
  patient: { uuid: 'patient-123' },
  visitType: mockVisitType,
  startDatetime: '2023-01-01T10:00:00Z',
  stopDatetime: null,
  location: { uuid: 'location-123', display: 'Test Location' },
  encounters: [],
  attributes: [],
  voided: false,
  links: [],
  resourceVersion: '1.8',
} as Visit;

describe('useDeleteVisit', () => {
  beforeEach(() => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: jest.fn(),
      setPatient: jest.fn(),
      setVisitContext: mockSetVisitContext,
    });

    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);
  });

  it('should delete visit successfully and trigger revalidation', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const onVisitDelete = jest.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockDeleteVisit).toHaveBeenCalledWith('visit-123');
    expect(mockInvalidateVisitAndEncounterData).toHaveBeenCalledWith(mockGlobalMutate, 'patient-123');

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Outpatient Visit deleted',
        subtitle: 'Outpatient Visit deleted successfully',
        kind: 'success',
        actionButtonLabel: 'Undo',
        onActionButtonClick: expect.any(Function),
      }),
    );

    expect(onVisitDelete).toHaveBeenCalled();
  });

  it('should handle delete error and trigger revalidation', async () => {
    mockDeleteVisit.mockRejectedValue(new Error('Delete failed'));
    const onVisitDelete = jest.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockInvalidateVisitAndEncounterData).toHaveBeenCalledWith(mockGlobalMutate, 'patient-123');

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Error deleting visit',
      kind: 'error',
      subtitle: 'An error occurred when deleting visit',
    });

    expect(onVisitDelete).not.toHaveBeenCalled();
  });

  it('should restore visit successfully when undo is clicked', async () => {
    mockRestoreVisit.mockResolvedValue({ data: {} } as any);
    const onVisitRestore = jest.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, undefined, onVisitRestore));

    // First delete to get the restore function
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    // Get the restore function from the snackbar
    const restoreFunction = mockShowSnackbar.mock.calls[0][0].onActionButtonClick;

    // Clear mocks to test restore independently
    jest.clearAllMocks();
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: jest.fn(),
      setPatient: jest.fn(),
      setVisitContext: mockSetVisitContext,
    });
    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);

    // Test restore functionality
    await act(async () => {
      restoreFunction();
    });

    expect(mockRestoreVisit).toHaveBeenCalledWith('visit-123');
    expect(mockInvalidateVisitAndEncounterData).toHaveBeenCalledWith(mockGlobalMutate, 'patient-123');

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Visit restored',
      subtitle: 'Outpatient Visit restored successfully',
      kind: 'success',
    });

    expect(onVisitRestore).toHaveBeenCalled();
  });

  it('should handle restore error and trigger revalidation', async () => {
    mockRestoreVisit.mockRejectedValue(new Error('Restore failed'));
    const onVisitRestore = jest.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, undefined, onVisitRestore));

    // First delete to get the restore function
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    const restoreFunction = mockShowSnackbar.mock.calls[0][0].onActionButtonClick;

    // Clear mocks to test restore independently
    jest.clearAllMocks();
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: jest.fn(),
      setPatient: jest.fn(),
      setVisitContext: mockSetVisitContext,
    });
    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);

    // Test restore error
    await act(async () => {
      restoreFunction();
    });

    expect(mockInvalidateVisitAndEncounterData).toHaveBeenCalledWith(mockGlobalMutate, 'patient-123');

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: "Visit couldn't be restored",
      subtitle: 'Error occurred when restoring Outpatient Visit',
      kind: 'error',
    });

    expect(onVisitRestore).not.toHaveBeenCalled();
  });

  it('should manage loading state correctly', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);

    const { result } = renderHook(() => useDeleteVisit(mockVisit, () => {}));

    // Initially not deleting
    expect(result.current.isDeletingVisit).toBe(false);

    // Start deletion and wait for completion
    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    // Should no longer be loading after completion
    expect(result.current.isDeletingVisit).toBe(false);
  });

  it('should handle visit with missing patient UUID', () => {
    const visitWithoutPatient = { ...mockVisit, patient: null };

    expect(() => {
      renderHook(() => useDeleteVisit(visitWithoutPatient, () => {}));
    }).not.toThrow();
  });

  it('should handle visit with empty patient UUID', () => {
    const visitWithEmptyPatient = { ...mockVisit, patient: { uuid: '' } };

    expect(() => {
      renderHook(() => useDeleteVisit(visitWithEmptyPatient, () => {}));
    }).not.toThrow();
  });

  it('should handle visit with missing visit type display', async () => {
    const visitWithoutDisplay = {
      ...mockVisit,
      visitType: { ...mockVisitType, display: undefined },
    };

    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const { result } = renderHook(() => useDeleteVisit(visitWithoutDisplay, () => {}));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    // Should complete without throwing
    expect(mockDeleteVisit).toHaveBeenCalled();
  });
});
