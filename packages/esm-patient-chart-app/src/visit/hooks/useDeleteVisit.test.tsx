import { useSWRConfig } from 'swr';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
  invalidateVisitByUuid: vi.fn(),
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

const mockQueueEntry = {
  uuid: 'queue-entry-123',
  queue: { uuid: 'queue-uuid-1' },
  patient: { uuid: 'patient-123' },
  priority: { uuid: 'priority-uuid-1' },
  status: { uuid: 'status-uuid-1' },
  startedAt: '2023-01-01T10:00:00Z',
};

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

  it('should fetch the queue entry BEFORE deleting the visit', async () => {
    const callOrder: string[] = [];

    mockOpenmrsFetch.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('/visit-queue-entry')) {
        callOrder.push('fetchQueueEntry');
        return { data: { results: [] } } as any;
      }
      return { data: {} } as any;
    });

    mockDeleteVisit.mockImplementation(async () => {
      callOrder.push('deleteVisit');
      return { data: {} } as any;
    });

    const { result } = renderHook(() => useDeleteVisit(mockVisit, () => {}));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(callOrder[0]).toBe('fetchQueueEntry');
    expect(callOrder[1]).toBe('deleteVisit');
  });

  it('should end (not void) the queue entry using POST with endedAt', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { results: [{ queueEntry: mockQueueEntry }] } } as any)
      .mockResolvedValueOnce({ data: {} } as any);
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);

    const { result } = renderHook(() => useDeleteVisit(mockVisit, () => {}));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue-entry/queue-entry-123'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('endedAt'),
      }),
    );
  });

  it('should not call end queue entry if no queue entry exists for the visit', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: { results: [] } } as any);
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const onVisitDelete = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1); // only the GET, no POST
    expect(onVisitDelete).toHaveBeenCalled();
  });

  it('should show a warning snackbar if ending the queue entry fails', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { results: [{ queueEntry: mockQueueEntry }] } } as any)
      .mockRejectedValueOnce(new Error('Queue API error'));
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const onVisitDelete = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, onVisitDelete));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    // Should show warning for queue failure
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'warning',
      }),
    );

    // Visit deletion should still succeed
    expect(onVisitDelete).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
      }),
    );
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

  it('should restore visit and re-create the queue entry on undo', async () => {
    // First: delete visit with a queue entry
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { results: [{ queueEntry: mockQueueEntry }] } } as any) // fetch queue entry
      .mockResolvedValueOnce({ data: {} } as any); // end queue entry
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const onVisitRestore = vi.fn();

    const { result } = renderHook(() => useDeleteVisit(mockVisit, undefined, onVisitRestore));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    const restoreFunction = mockShowSnackbar.mock.calls.find(
      (call) => call[0].kind === 'success' && call[0].actionButtonLabel,
    )?.[0].onActionButtonClick;

    expect(restoreFunction).toBeDefined();

    // Now restore
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

    mockRestoreVisit.mockResolvedValue({ data: { stopDatetime: null, uuid: 'visit-123' } } as any);
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as any); // re-create queue entry

    await act(async () => {
      restoreFunction();
    });

    expect(mockRestoreVisit).toHaveBeenCalledWith('visit-123');

    // Should re-create the queue entry
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue-entry'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('queue'),
      }),
    );

    expect(onVisitRestore).toHaveBeenCalled();
  });

  it('should show warning if queue entry restore fails on undo', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { results: [{ queueEntry: mockQueueEntry }] } } as any)
      .mockResolvedValueOnce({ data: {} } as any);
    mockDeleteVisit.mockResolvedValue({ data: {} } as any);

    const { result } = renderHook(() => useDeleteVisit(mockVisit));

    await act(async () => {
      result.current.initiateDeletingVisit();
    });

    const restoreFunction = mockShowSnackbar.mock.calls.find(
      (call) => call[0].kind === 'success' && call[0].actionButtonLabel,
    )?.[0].onActionButtonClick;

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

    mockRestoreVisit.mockResolvedValue({ data: { stopDatetime: null, uuid: 'visit-123' } } as any);
    mockOpenmrsFetch.mockRejectedValue(new Error('Queue restore failed'));

    await act(async () => {
      restoreFunction();
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'warning',
        title: expect.stringContaining('Queue entry not restored'),
      }),
    );
  });

  it('should handle restore error and trigger revalidation', async () => {
    mockRestoreVisit.mockRejectedValue(new Error('Restore failed'));

    mockDeleteVisit.mockResolvedValue({ data: {} } as any);
    const { result } = renderHook(() => useDeleteVisit(mockVisit));

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
