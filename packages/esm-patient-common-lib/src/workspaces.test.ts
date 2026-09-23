import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { showModal, useFeatureFlag, type Visit } from '@openmrs/esm-framework';
import { setPatientChartWorkspaceGroupVisitUuid, usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import { useStartVisitIfNeeded } from './workspaces';

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
