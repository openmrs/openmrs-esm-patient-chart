import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { launchWorkspaceGroup2, openmrsFetch, usePatient, useVisit, type Visit } from '@openmrs/esm-framework';
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
const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUsePatient = vi.mocked(usePatient);
const mockUseVisit = vi.mocked(useVisit);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

const mutateVisit = vi.fn();
const setPatient = vi.fn();
const setVisitContext = vi.fn();
const setWorkspaceGroupVisitUuid = vi.mocked(setPatientChartWorkspaceGroupVisitUuid);

// The group props the workspace group was launched with are recorded alongside its visit uuid
const groupPropsFor = (visit: Visit) =>
  expect.objectContaining({ visitContext: expect.objectContaining({ uuid: visit.uuid }) });

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
    mutate: mutateVisit,
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
      setPatient,
      setVisitContext,
    });
    mockUseVisit.mockReturnValue({
      activeVisit: null,
      mutate: mutateVisit,
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
      mutate: mutateVisit,
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
      mutate: mutateVisit,
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
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitB.uuid, groupPropsFor(visitB));
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
      mutate: mutateVisit,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() =>
      expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid, groupPropsFor(visitA)),
    );

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
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid, groupPropsFor(visitA));
  });

  it('does not launch the active-visit group until the store patient identity is restored on recovery', async () => {
    const retrospectiveVisit = { uuid: 'retrospective-visit', patient: { uuid: mockFhirPatient.id } } as Visit;
    const refetchedRetrospectiveVisit = {
      ...retrospectiveVisit,
      display: 'Refetched retrospective visit',
    } as Visit;
    const goneError = () => Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } });

    // The active-visit fetch settled while the patient was unavailable. The store was
    // cleared on unavailability, so its patient identity is null and the saved
    // retrospective visit is masked.
    mockUseVisit.mockImplementation(() => ({
      activeVisit: visitA,
      mutate: mutateVisit,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: null,
      patient: null,
      visitContext: null,
      setPatient,
      setVisitContext,
    });
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: goneError(),
    });

    // The framework mock's openmrsFetch never resolves; resolve the retrospective
    // visit refetch for this test and restore the default afterwards.
    mockOpenmrsFetch.mockResolvedValue({ data: refetchedRetrospectiveVisit } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        SWRConfig,
        {
          value: {
            dedupingInterval: 0,
            provider: () => new Map(),
          },
        },
        children,
      );
    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id), { wrapper });
    expect(mockLaunchWorkspaceGroup).not.toHaveBeenCalled();

    // The patient request recovers while the store identity is still null. The settled
    // active visit must not launch a group that would override the retrospective visit.
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    rerender();

    await waitFor(() => expect(setPatient).toHaveBeenCalledWith(mockFhirPatient));
    expect(mockLaunchWorkspaceGroup).not.toHaveBeenCalled();

    // Once the store identity is restored, the retrospective visit is unmasked and the
    // group launches with its refetch instead of the settled active visit.
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockFhirPatient.id,
      patient: mockFhirPatient,
      visitContext: retrospectiveVisit,
      setPatient,
      setVisitContext,
    });
    mockUseVisit.mockImplementation(() => ({
      activeVisit: null,
      mutate: mutateVisit,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspaceGroup).toHaveBeenLastCalledWith(
      'patient-chart',
      expect.objectContaining({ patientUuid: mockFhirPatient.id, visitContext: refetchedRetrospectiveVisit }),
    );
    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}));
  });

  it('relaunches the patient-chart workspace group when the visit context changes', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisit,
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
      }),
    );
  });

  it('records the visit the workspace group was relaunched with', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisit,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));

    await waitFor(() =>
      expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid, groupPropsFor(visitA)),
    );
    expect(mockLaunchWorkspaceGroup.mock.invocationCallOrder[0]).toBeLessThan(
      setWorkspaceGroupVisitUuid.mock.invocationCallOrder.at(-1),
    );

    activeVisit = visitB;
    rerender();

    await waitFor(() =>
      expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitB.uuid, groupPropsFor(visitB)),
    );
  });

  it('does not record a new visit when the workspace group relaunch is declined', async () => {
    let activeVisit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisit,
      isValidating: false,
      error: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
    }));

    const { rerender } = renderHook(() => usePatientChartPatientAndVisit(mockFhirPatient.id));
    await waitFor(() =>
      expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid, groupPropsFor(visitA)),
    );

    mockLaunchWorkspaceGroup.mockResolvedValueOnce(false);
    activeVisit = visitB;
    rerender();

    await waitFor(() => expect(mockLaunchWorkspaceGroup).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(setWorkspaceGroupVisitUuid).toHaveBeenCalledTimes(2));
    expect(setWorkspaceGroupVisitUuid).toHaveBeenLastCalledWith(visitA.uuid, groupPropsFor(visitA));
  });

  it('does not relaunch when the same visit UUID is returned with new object references', async () => {
    let activeVisit: Visit = visitA;
    mockUseVisit.mockImplementation(() => ({
      activeVisit,
      mutate: mutateVisit,
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
      mutate: mutateVisit,
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
