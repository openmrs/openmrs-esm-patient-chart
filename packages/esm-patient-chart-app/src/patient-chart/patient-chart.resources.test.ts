import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { launchWorkspaceGroup2, usePatient, useVisit, type Visit } from '@openmrs/esm-framework';
import { setPatientChartWorkspaceGroupVisitUuid, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient } from '__mocks__';
import { usePatientChartPatientAndVisit } from './patient-chart.resources';

// TODO: remove once openmrs-esm-core ships launchWorkspaceGroup2 in the framework mock
vi.mock('@openmrs/esm-framework', async () => {
  const actual = (await vi.importActual('@openmrs/esm-framework')) as object;
  return { ...actual, launchWorkspaceGroup2: vi.fn() };
});

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  setPatientChartWorkspaceGroupVisitUuid: vi.fn(),
  usePatientChartStore: vi.fn(),
}));

const mockLaunchWorkspaceGroup = vi.mocked(launchWorkspaceGroup2);
const mockUsePatient = vi.mocked(usePatient);
const mockUseVisit = vi.mocked(useVisit);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

const mutateVisitContext = vi.fn();
const setPatient = vi.fn();
const setVisitContext = vi.fn();
const setWorkspaceGroupVisitUuid = vi.mocked(setPatientChartWorkspaceGroupVisitUuid);

const visitA = { uuid: 'visit-a', patient: { uuid: mockFhirPatient.id } } as Visit;
const visitB = { uuid: 'visit-b', patient: { uuid: mockFhirPatient.id } } as Visit;
const patientB = { ...mockFhirPatient, id: 'patient-b' };

function mockNoActiveVisitForPatientSwitch() {
  mockUsePatient.mockImplementation((patientUuid) => ({
    isLoading: false,
    patient: patientUuid === patientB.id ? patientB : mockFhirPatient,
    patientUuid,
    error: null,
  }));
  mockUseVisit.mockImplementation(() => ({
    activeVisit: null,
    mutate: mutateVisitContext,
    isValidating: false,
    error: null,
    currentVisit: null,
    currentVisitIsRetrospective: false,
    isLoading: false,
  }));
  mockUsePatientChartStore.mockImplementation((patientUuid) => ({
    patientUuid,
    patient: patientUuid === patientB.id ? patientB : mockFhirPatient,
    visitContext: null,
    mutateVisitContext: null,
    setPatient,
    setVisitContext,
  }));
}

describe('usePatientChartPatientAndVisit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLaunchWorkspaceGroup.mockResolvedValue(true);
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockFhirPatient.id,
      patient: mockFhirPatient,
      visitContext: null,
      mutateVisitContext: null,
      setPatient,
      setVisitContext,
    });
    mockUseVisit.mockReturnValue({
      activeVisit: null,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    });
  });

  it('preserves the patient-load error for an unavailable patient', () => {
    const error = Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } });
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: undefined,
      patientUuid: mockFhirPatient.id,
      error,
    });

    const { result } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    expect(result.current).toEqual(expect.objectContaining({ error }));
    expect(result.current.patient).toBeUndefined();
    expect(mockLaunchWorkspaceGroup).not.toHaveBeenCalled();
  });

  it('preserves missing patient data when loading completes without an error', () => {
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: null,
      patientUuid: mockFhirPatient.id,
      error: null,
    });

    const { result } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    expect(result.current.patient).toBeNull();
    expect(mockLaunchWorkspaceGroup).not.toHaveBeenCalled();
  });

  it('does not launch or store a retained patient when the patient request has errored', () => {
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } }),
    });

    renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    expect(mockLaunchWorkspaceGroup).not.toHaveBeenCalled();
    expect(setPatient).toHaveBeenLastCalledWith(null);
    expect(setVisitContext).not.toHaveBeenCalled();
  });

  it('clears a cached patient and suppresses visit launches until the patient request recovers', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));

    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } }),
    });
    activeVisit = visitB;
    rerender();

    expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1);
    expect(setPatient).toHaveBeenLastCalledWith(null);

    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: mockFhirPatient.id, visitContext: visitB }),
    );
    expect(setPatient).toHaveBeenLastCalledWith(mockFhirPatient);
  });

  it('does not launch a queued visit or publish its context after a pending launch resolves while unavailable', async () => {
    let activeVisit = visitA;
    let resolveFirstLaunch!: (value: boolean) => void;
    mockLaunchWorkspaceGroup.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveFirstLaunch = resolve;
      }),
    );
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));

    activeVisit = visitB;
    rerender();
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } }),
    });
    rerender();
    setWorkspaceGroupVisitUuid.mockClear();

    await act(async () => resolveFirstLaunch(true));

    expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1);
    expect(setWorkspaceGroupVisitUuid).not.toHaveBeenCalled();
    expect(setPatient).toHaveBeenLastCalledWith(null);

    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    rerender();
    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ visitContext: visitB }),
    );
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitB.uuid);
  });

  it('reconciles the recovered visit after an invalidated launch may have changed the framework group', async () => {
    let activeVisit = visitA;
    let resolveSecondLaunch!: (value: boolean) => void;
    mockLaunchWorkspaceGroup.mockResolvedValueOnce(true).mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveSecondLaunch = resolve;
      }),
    );
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid));

    activeVisit = visitB;
    rerender();
    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: new Error('Network error'),
    });
    rerender();
    setWorkspaceGroupVisitUuid.mockClear();
    await act(async () => resolveSecondLaunch(true));
    expect(setWorkspaceGroupVisitUuid).not.toHaveBeenCalled();

    activeVisit = visitA;
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(3));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ visitContext: visitA }),
    );
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid);
  });

  it('relaunches the patient-chart workspace group when the visit context changes', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({
        patient: mockFhirPatient,
        patientUuid: mockFhirPatient.id,
        visitContext: visitA,
        mutateVisitContext,
      }),
    );

    activeVisit = visitB;
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({
        patient: mockFhirPatient,
        patientUuid: mockFhirPatient.id,
        visitContext: visitB,
        mutateVisitContext,
      }),
    );
  });

  it('records the visit the workspace group was relaunched with', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid));
    expect(mockLaunchWorkspaceGroup.mock.invocationCallOrder[0]).toBeLessThan(
      setWorkspaceGroupVisitUuid.mock.invocationCallOrder.at(-1),
    );

    activeVisit = visitB;
    rerender();

    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitB.uuid));
  });

  it('does not record a new visit when the workspace group relaunch is declined', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid));

    mockLaunchWorkspaceGroup.mockResolvedValueOnce(false);
    activeVisit = visitB;
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenCalledTimes(2));
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid);
  });

  it('does not relaunch when the same visit UUID is returned with new object references', async () => {
    let activeVisit: Visit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));

    // Same UUID, new object reference — mimics SWR revalidation
    activeVisit = { ...visitA, stopDatetime: '2026-05-26T00:00:00.000Z' } as Visit;
    rerender();

    // Wait for the effect to fire before asserting the launch count didn't increase
    await waitFor(() => expect(setVisitContext).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1);
  });

  it('relaunches when the patient changes and neither patient has an active visit', async () => {
    mockNoActiveVisitForPatientSwitch();

    const { rerender } = renderHook(({ patientUuid }) => usePatientChartPatientAndVisit(patientUuid), {
      initialProps: { patientUuid: mockFhirPatient.id },
    });

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: mockFhirPatient.id, visitContext: null }),
    );

    rerender({ patientUuid: patientB.id });

    await waitFor(() => expect(setVisitContext).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: patientB.id, visitContext: null }),
    );
  });

  it('launches the latest patient after a previous launch resolves', async () => {
    let patientUuid = mockFhirPatient.id;
    let resolveFirstLaunch!: (value: boolean) => void;
    const firstLaunch = new Promise<boolean>((resolve) => {
      resolveFirstLaunch = resolve;
    });

    mockLaunchWorkspaceGroup.mockReturnValueOnce(firstLaunch).mockResolvedValue(true);
    mockNoActiveVisitForPatientSwitch();

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(patientUuid));

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: mockFhirPatient.id, visitContext: null }),
    );

    patientUuid = patientB.id;
    rerender();

    await waitFor(() => expect(setVisitContext).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1);

    resolveFirstLaunch(true);

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: patientB.id, visitContext: null }),
    );
  });

  it('launches the latest visit context after a previous launch resolves', async () => {
    let activeVisit = visitA;
    let resolveFirstLaunch!: (value: boolean) => void;
    const firstLaunch = new Promise<boolean>((resolve) => {
      resolveFirstLaunch = resolve;
    });

    mockLaunchWorkspaceGroup.mockReturnValueOnce(firstLaunch).mockResolvedValue(true);
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisitContext,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ visitContext: visitA }),
    );

    activeVisit = visitB;
    rerender();

    await waitFor(() => expect(setVisitContext).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1);

    resolveFirstLaunch(true);

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ visitContext: visitB }),
    );
  });
});
