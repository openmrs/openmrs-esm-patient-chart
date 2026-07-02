import { useSWRConfig } from 'swr';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { openmrsFetch, showSnackbar, type Visit } from '@openmrs/esm-framework';
import {
  invalidateCurrentVisit,
  invalidateVisitAndEncounterData,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';
import { useDeleteVisit } from './useDeleteVisit';
import { deleteVisit, restoreVisit } from '../visits-widget/visit.resource';

vi.mock('swr', () => ({
  useSWRConfig: vi.fn(),
}));

vi.mock('../visits-widget/visit.resource', async () => {
  const original = (await vi.importActual('../visits-widget/visit.resource')) as object;
  return {
    ...original,
    deleteVisit: vi.fn(),
    restoreVisit: vi.fn(),
  };
});

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  invalidateCurrentVisit: vi.fn(),
  invalidateVisitAndEncounterData: vi.fn(),
  usePatientChartStore: vi.fn(),
}));

const mockDeleteVisit = vi.mocked(deleteVisit);
const mockRestoreVisit = vi.mocked(restoreVisit);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseSWRConfig = vi.mocked(useSWRConfig);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockInvalidateVisitAndEncounterData = vi.mocked(invalidateVisitAndEncounterData);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const mockGlobalMutate = vi.fn();
const mockSetVisitContext = vi.fn();

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
    vi.clearAllMocks();

    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: vi.fn(),
      setPatient: vi.fn(),
      setVisitContext: mockSetVisitContext,
    });

    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);

    // Default: no queue entry found
    mockOpenmrsFetch.mockResolvedValue({ data: { results: [] } } as any);
  });

  it('should delete visit successfully and trigger revalidation', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const onVisitDelete = vi.fn();

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

  it('should void the queue entry associated with the visit on deletion', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    mockOpenmrsFetch
      .mockResolvedValueOnce({
        data: { results: [{ queueEntry: { uuid: 'queue-entry-123' } }] },
      } as any)
      .mockResolvedValueOnce({ data: {} } as any);

    const { result } = renderHook(() => useDeleteVisit(mockVisit, () => {}));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(expect.stringContaining('/visit-queue-entry?visit=visit-123'));
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue-entry/queue-entry-123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('should not call DELETE if no queue entry exists for the visit', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    mockOpenmrsFetch.mockResolvedValueOnce({ data: { results: [] } } as any);

    const onVisitDelete = vi.fn();
    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1); // only the GET, no DELETE
    expect(onVisitDelete).toHaveBeenCalled();
  });

  it('should still complete visit deletion if voiding queue entry fails', async () => {
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    mockOpenmrsFetch.mockRejectedValueOnce(new Error('Queue API error'));
    const onVisitDelete = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(onVisitDelete).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });

  it('should handle delete error and trigger revalidation', async () => {
    mockDeleteVisit.mockRejectedValue(new Error('Delete failed'));
    const onVisitDelete = vi.fn();

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
    const onVisitRestore = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, undefined, onVisitRestore));

    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    const restoreFunction = mockShowSnackbar.mock.calls[0][0].onActionButtonClick;

    vi.clearAllMocks();
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: vi.fn(),
      setPatient: vi.fn(),
      setVisitContext: mockSetVisitContext,
    });
    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);

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
    const onVisitRestore = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, undefined, onVisitRestore));

    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    const restoreFunction = mockShowSnackbar.mock.calls[0][0].onActionButtonClick;

    vi.clearAllMocks();
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'patient-123',
      patient: null,
      visitContext: null,
      mutateVisitContext: vi.fn(),
      setPatient: vi.fn(),
      setVisitContext: mockSetVisitContext,
    });
    mockUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
      cache: new Map(),
    } as any);

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

    expect(result.current.isDeletingVisit).toBe(false);

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

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

    expect(mockDeleteVisit).toHaveBeenCalled();
  });
});
