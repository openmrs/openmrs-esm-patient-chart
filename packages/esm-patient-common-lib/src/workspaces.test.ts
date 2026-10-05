import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { launchWorkspace2, showModal, useFeatureFlag, type Visit } from '@openmrs/esm-framework';
import { setPatientChartWorkspaceGroupVisitUuid, usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import {
  getPatientAndVisitProps,
  getPatientChartWindowProps,
  useActionMenuButtonLaunchProps,
  useLaunchWorkspaceRequiringVisit,
  useStartVisitIfNeeded,
} from './workspaces';

vi.mock('./useSystemVisitSetting', () => ({
  useSystemVisitSetting: vi.fn(),
}));

const mockShowModal = vi.mocked(showModal);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);

const patient = { id: 'patient-uuid' } as fhir.Patient;
const visit = { uuid: 'visit-uuid', patient: { uuid: patient.id } } as Visit;

function setUpStartVisitIfNeeded() {
  const { result } = renderHook(() => ({
    store: usePatientChartStore(patient.id),
    startVisitIfNeeded: useStartVisitIfNeeded(patient.id),
  }));
  act(() => result.current.store.setPatient(patient));
  return result;
}

function trackSettlement(promise: Promise<boolean>) {
  const settlement: { settled: boolean; value?: boolean } = { settled: false };
  promise.then((value) => {
    settlement.settled = true;
    settlement.value = value;
  });
  return settlement;
}

function getModalProps(modalName: string) {
  const call = mockShowModal.mock.calls.find(([name]) => name === modalName);
  return call[1] as Record<string, any>;
}

describe('useStartVisitIfNeeded', () => {
  beforeEach(() => {
    mockShowModal.mockReturnValue(vi.fn());
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
  });

  afterEach(() => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    act(() => {
      result.current.setVisitContext(null, null);
      result.current.setPatient(null);
      setPatientChartWorkspaceGroupVisitUuid(null);
    });
  });

  it('resolves true without prompting when the patient already has a visit context', async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    const result = setUpStartVisitIfNeeded();
    act(() => result.current.store.setVisitContext(visit, null));

    await expect(result.current.startVisitIfNeeded()).resolves.toBe(true);
    expect(mockShowModal).not.toHaveBeenCalled();
  });

  it('waits for the workspace group to have the new visit before resolving a started visit', async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    const result = setUpStartVisitIfNeeded();

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.startVisitIfNeeded();
    });
    const settlement = trackSettlement(promise);
    const { onVisitStarted } = getModalProps('start-visit-dialog');

    await act(async () => {
      result.current.store.setVisitContext(visit, null);
      onVisitStarted();
    });
    expect(settlement.settled).toBe(false);

    await act(async () => setPatientChartWorkspaceGroupVisitUuid(visit.uuid));
    expect(settlement).toEqual({ settled: true, value: true });
  });

  it('resolves false and closes the dialog when starting a visit is cancelled', async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    const dispose = vi.fn();
    mockShowModal.mockReturnValue(dispose);
    const result = setUpStartVisitIfNeeded();

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.startVisitIfNeeded();
    });
    const { onCancel } = getModalProps('start-visit-dialog');
    act(() => onCancel());

    await expect(promise).resolves.toBe(false);
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('resolves every pending prompt once the workspace group has the new visit', async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    const result = setUpStartVisitIfNeeded();

    let first: Promise<boolean>;
    let second: Promise<boolean>;
    act(() => {
      first = result.current.startVisitIfNeeded();
      second = result.current.startVisitIfNeeded();
    });
    const dialogs = mockShowModal.mock.calls
      .filter(([name]) => name === 'start-visit-dialog')
      .map(([, props]) => props as Record<string, any>);
    expect(dialogs).toHaveLength(2);

    await act(async () => {
      result.current.store.setVisitContext(visit, null);
      dialogs.forEach(({ onVisitStarted }) => onVisitStarted());
    });
    await act(async () => setPatientChartWorkspaceGroupVisitUuid(visit.uuid));

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('waits for the workspace group to have the selected visit before resolving, even after the switcher closes', async () => {
    mockUseFeatureFlag.mockReturnValue(true);
    const result = setUpStartVisitIfNeeded();

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.startVisitIfNeeded();
    });
    const settlement = trackSettlement(promise);
    const { onAfterVisitSelected, closeModal } = getModalProps('visit-context-switcher');

    // The visit context switcher sets the visit context, reports the selection, then closes itself.
    await act(async () => {
      result.current.store.setVisitContext(visit, null);
      onAfterVisitSelected();
      closeModal();
    });
    expect(settlement.settled).toBe(false);

    await act(async () => setPatientChartWorkspaceGroupVisitUuid(visit.uuid));
    expect(settlement).toEqual({ settled: true, value: true });
  });

  it('resolves false when the visit context switcher closes without a selection', async () => {
    mockUseFeatureFlag.mockReturnValue(true);
    const result = setUpStartVisitIfNeeded();

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.startVisitIfNeeded();
    });
    const { closeModal } = getModalProps('visit-context-switcher');
    act(() => closeModal());

    await expect(promise).resolves.toBe(false);
  });
});

describe('getPatientChartWindowProps', () => {
  const mutateVisitContext = vi.fn();

  afterEach(() => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    act(() => {
      result.current.setVisitContext(null, null);
      result.current.setPatient(null);
      setPatientChartWorkspaceGroupVisitUuid(null, null);
    });
  });

  it('returns the props the workspace group was launched with, not the latest store values', () => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    const groupProps = { patient, patientUuid: patient.id, visitContext: visit, mutateVisitContext };
    act(() => result.current.setPatient(patient));
    act(() => {
      result.current.setVisitContext({ ...visit }, vi.fn());
      setPatientChartWorkspaceGroupVisitUuid(visit.uuid, groupProps);
    });

    expect(getPatientChartWindowProps(patient.id)).toEqual({ patient, patientUuid: patient.id, visitContext: visit });
    expect(getPatientChartWindowProps(patient.id).visitContext).toBe(visit);
  });

  it('falls back to the store values when no workspace group was launched', () => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    act(() => result.current.setPatient(patient));
    act(() => result.current.setVisitContext(visit, mutateVisitContext));

    expect(getPatientChartWindowProps(patient.id)).toEqual({
      patient,
      patientUuid: patient.id,
      visitContext: visit,
    });
  });

  it("does not return another patient's chart context", () => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    act(() => result.current.setPatient(patient));
    act(() => result.current.setVisitContext(visit, mutateVisitContext));

    expect(getPatientChartWindowProps('other-patient-uuid')).toEqual({
      patient: null,
      patientUuid: 'other-patient-uuid',
      visitContext: null,
    });
  });
});

describe('getPatientAndVisitProps', () => {
  it('prefers window props over the deprecated workspace props', () => {
    const otherPatient = { id: 'other' } as fhir.Patient;
    expect(
      getPatientAndVisitProps(
        { patient, patientUuid: patient.id, visitContext: visit },
        { patient: otherPatient, patientUuid: 'other', visitContext: null },
      ),
    ).toEqual({ patient, patientUuid: patient.id, visitContext: visit });
  });

  it('falls back to workspace props when there are no window props', () => {
    expect(getPatientAndVisitProps(null, { patient, patientUuid: patient.id, visitContext: visit })).toEqual({
      patient,
      patientUuid: patient.id,
      visitContext: visit,
    });
  });
});

describe('useLaunchWorkspaceRequiringVisit', () => {
  const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

  beforeEach(() => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: false,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
  });

  afterEach(() => {
    const { result } = renderHook(() => usePatientChartStore(patient.id));
    act(() => {
      result.current.setVisitContext(null, null);
      result.current.setPatient(null);
      setPatientChartWorkspaceGroupVisitUuid(null, null);
    });
    mockLaunchWorkspace2.mockClear();
  });

  it('supplies the patient chart window props, which the caller can override', async () => {
    const { result } = renderHook(() => ({
      store: usePatientChartStore(patient.id),
      launch: useLaunchWorkspaceRequiringVisit(patient.id, 'some-workspace'),
    }));
    act(() => result.current.store.setPatient(patient));
    act(() => result.current.store.setVisitContext(visit, null));

    await act(async () => result.current.launch({ a: 1 } as any, { extra: true }));

    await vi.waitFor(() => expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1));
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'some-workspace',
      { a: 1 },
      { patient, patientUuid: patient.id, visitContext: visit, extra: true },
      undefined,
    );
  });

  it('supplies the window props of the visit started by the prompt, not the visit-less props from before it', async () => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    mockUseFeatureFlag.mockReturnValue(false);
    mockShowModal.mockReturnValue(vi.fn());
    const groupPropsWithoutVisit = { patient, patientUuid: patient.id, visitContext: null, mutateVisitContext: null };
    const { result } = renderHook(() => ({
      store: usePatientChartStore(patient.id),
      launch: useActionMenuButtonLaunchProps(groupPropsWithoutVisit, 'some-workspace'),
    }));
    act(() => result.current.store.setPatient(patient));
    act(() => setPatientChartWorkspaceGroupVisitUuid(null, groupPropsWithoutVisit));

    // The button holds the props of the render it was clicked in, and does not wait for the launch to happen
    expect(result.current.launch.workspaceToLaunch.windowProps.visitContext).toBeNull();
    let shouldLaunch: Promise<boolean>;
    act(() => {
      shouldLaunch = result.current.launch.onBeforeWorkspaceLaunch();
    });
    const { onVisitStarted } = getModalProps('start-visit-dialog');

    // The visit is started, and the chart relaunches its workspace group with it
    await act(async () => {
      result.current.store.setVisitContext(visit, null);
      onVisitStarted();
    });
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
    const groupPropsWithVisit = { patient, patientUuid: patient.id, visitContext: visit, mutateVisitContext: null };
    await act(async () => setPatientChartWorkspaceGroupVisitUuid(visit.uuid, groupPropsWithVisit));

    await expect(shouldLaunch).resolves.toBe(false);
    await vi.waitFor(() => expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1));
    const windowProps = mockLaunchWorkspace2.mock.calls[0][2] as Record<string, unknown>;
    expect(windowProps).toMatchObject({ patientUuid: patient.id });
    expect(windowProps.visitContext).toBe(visit);
  });

  it('lets the action menu button launch with its own window props when the visit did not change', async () => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    const groupPropsWithVisit = { patient, patientUuid: patient.id, visitContext: visit, mutateVisitContext: null };
    const { result } = renderHook(() => ({
      store: usePatientChartStore(patient.id),
      launch: useActionMenuButtonLaunchProps(groupPropsWithVisit, 'some-workspace'),
    }));
    act(() => result.current.store.setPatient(patient));
    act(() => result.current.store.setVisitContext(visit, null));
    act(() => setPatientChartWorkspaceGroupVisitUuid(visit.uuid, groupPropsWithVisit));

    await expect(result.current.launch.onBeforeWorkspaceLaunch()).resolves.toBe(true);
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
    expect(result.current.launch.workspaceToLaunch).toMatchObject({
      workspaceName: 'some-workspace',
      windowProps: { patient, patientUuid: patient.id, visitContext: visit },
    });
  });
});
