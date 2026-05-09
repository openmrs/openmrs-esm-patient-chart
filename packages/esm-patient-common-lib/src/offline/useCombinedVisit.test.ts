import { useConnectivity, useVisit } from '@openmrs/esm-framework';
import { renderHook } from '@testing-library/react';
import { useOfflineVisit } from './visit';
import { useCombinedVisit } from './useCombinedVisit';

jest.mock('@openmrs/esm-framework', () => ({
  useConnectivity: jest.fn(),
  useVisit: jest.fn(),
}));

jest.mock('./visit', () => ({
  useOfflineVisit: jest.fn(),
}));

const mockUseConnectivity = useConnectivity as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUseOfflineVisit = useOfflineVisit as jest.Mock;

const emptyResult = {
  activeVisit: null,
  currentVisit: null,
  isLoading: false,
  isValidating: false,
  error: null,
  mutate: jest.fn(),
};

describe('useCombinedVisit', () => {
  it('returns the online visit when online and active visit exists', () => {
    mockUseConnectivity.mockReturnValue(true);
    const onlineVisit = { ...emptyResult, activeVisit: { uuid: 'online-visit' } };
    mockUseVisit.mockReturnValue(onlineVisit);
    mockUseOfflineVisit.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useCombinedVisit('patient-1'));
    expect(result.current.activeVisit.uuid).toBe('online-visit');
  });

  it('returns the offline visit when offline', () => {
    mockUseConnectivity.mockReturnValue(false);
    mockUseVisit.mockReturnValue(emptyResult);
    const offlineVisit = { ...emptyResult, activeVisit: { uuid: 'offline-visit', visitType: { display: 'Offline' } } };
    mockUseOfflineVisit.mockReturnValue(offlineVisit);

    const { result } = renderHook(() => useCombinedVisit('patient-1'));
    expect(result.current.activeVisit.uuid).toBe('offline-visit');
  });

  it('returns the offline visit when online but no server visit exists', () => {
    mockUseConnectivity.mockReturnValue(true);
    mockUseVisit.mockReturnValue(emptyResult);
    const offlineVisit = { ...emptyResult, activeVisit: { uuid: 'offline-visit' } };
    mockUseOfflineVisit.mockReturnValue(offlineVisit);

    const { result } = renderHook(() => useCombinedVisit('patient-1'));
    expect(result.current.activeVisit.uuid).toBe('offline-visit');
  });

  it('returns null when no visit exists anywhere', () => {
    mockUseConnectivity.mockReturnValue(true);
    mockUseVisit.mockReturnValue(emptyResult);
    mockUseOfflineVisit.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useCombinedVisit('patient-1'));
    expect(result.current.activeVisit).toBeNull();
  });
});
