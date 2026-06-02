import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { launchWorkspaceGroup2, usePatient, useVisit, type Visit } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient } from '__mocks__';
import { usePatientChartPatientAndVisit } from './patient-chart.resources';

// TODO: remove once openmrs-esm-core ships launchWorkspaceGroup2 in the framework mock
vi.mock('@openmrs/esm-framework', async () => {
  const actual = (await vi.importActual('@openmrs/esm-framework')) as object;
  return { ...actual, launchWorkspaceGroup2: vi.fn() };
});

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  usePatientChartStore: vi.fn(),
}));

const mockLaunchWorkspaceGroup = vi.mocked(launchWorkspaceGroup2);
const mockUsePatient = vi.mocked(usePatient);
const mockUseVisit = vi.mocked(useVisit);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

const mutateVisitContext = vi.fn();
const setPatient = vi.fn();
const setVisitContext = vi.fn();

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
