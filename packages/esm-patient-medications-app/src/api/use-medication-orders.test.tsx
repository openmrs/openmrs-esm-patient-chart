import React from 'react';
import { SWRConfig } from 'swr';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch, restBaseUrl, useConfig, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type Order, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../config-schema';
import { useMedicationOrders } from './api';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);
// The framework mock wraps the real hook, which would otherwise call the real `openmrsFetch`.
const realUseOpenmrsFetchAll = mockUseOpenmrsFetchAll.getMockImplementation();

const drugOrderTypeUUID = '131168f4-15f5-102d-96e4-000c29c2a5d7';
const ordersPath = `${restBaseUrl}/order?patient=${mockPatient.id}`;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

function drugOrder(uuid: string, overrides: Partial<Order> = {}) {
  return {
    uuid,
    action: 'NEW',
    drug: { uuid: `drug-${uuid}`, display: `Drug ${uuid}` },
    dateActivated: '2024-01-01T08:00:00.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: null,
    ...overrides,
  } as unknown as Order;
}

function page(results: Array<Order>, nextUri?: string) {
  return {
    data: { results, links: nextUri ? [{ rel: 'next', uri: nextUri }] : [] },
  } as unknown as Awaited<ReturnType<typeof openmrsFetch>>;
}

// The server returns 50 orders per page by default, newest first.
const recentPastOrders = Array.from({ length: 50 }, (_, index) =>
  drugOrder(`past-${index + 1}`, {
    dateActivated: '2024-06-01T08:00:00.000+0000',
    autoExpireDate: '2024-06-02T08:00:00.000+0000',
  }),
);
const olderActiveOrder = drugOrder('older-active', { dateActivated: '2020-01-15T08:00:00.000+0000' });
const nextPageUri = `https://openmrs.example.org/openmrs${ordersPath}&startIndex=50`;

beforeEach(() => {
  // Drop responses a previous test queued but didn't use, so tests can't affect each other.
  mockOpenmrsFetch.mockReset();
});

describe('useMedicationOrders', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ drugOrderTypeUUID } as ConfigObject);
    mockUseOpenmrsFetchAll.mockImplementation((url, options) =>
      realUseOpenmrsFetchAll(url, { ...options, fetcher: mockOpenmrsFetch }),
    );
  });

  it('includes an active order that is only on the second page', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockResolvedValueOnce(page([olderActiveOrder]));

    const { result } = renderHook(() => useMedicationOrders(mockPatient.id), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeOrders.map((order) => order.uuid)).toEqual(['older-active']);
    expect(result.current.pastOrders).toHaveLength(50);
  });

  it('requests later pages from the current origin, without the port of the next link', async () => {
    // A chart served without a port, behind a proxy that passes on the backend's own host and port.
    vi.stubGlobal('location', new URL('https://emr.example.org/openmrs/spa/patient/123/chart'));
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, `http://backend:8080/openmrs${ordersPath}&startIndex=50`))
      .mockResolvedValueOnce(page([olderActiveOrder]));

    try {
      const { result } = renderHook(() => useMedicationOrders(mockPatient.id), { wrapper });
      await waitFor(() => expect(result.current.activeOrders).toHaveLength(1));
    } finally {
      vi.unstubAllGlobals();
    }

    expect(mockOpenmrsFetch.mock.calls[1][0]).toBe(`https://emr.example.org/openmrs${ordersPath}&startIndex=50`);
  });

  it('reports an error when a later page fails', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useMedicationOrders(mockPatient.id), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pastOrders).toEqual([]);
  });

  it('is refreshed by useMutatePatientOrders after orders are saved', async () => {
    mockOpenmrsFetch.mockResolvedValue(page([olderActiveOrder]));

    const { result } = renderHook(
      () => ({
        medicationOrders: useMedicationOrders(mockPatient.id),
        mutateOrders: useMutatePatientOrders(mockPatient.id).mutate,
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.medicationOrders.activeOrders).toHaveLength(1));
    mockOpenmrsFetch.mockClear();

    await act(() => result.current.mutateOrders());

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(expect.stringContaining(ordersPath));
  });

  it('shows changes on every page after orders are saved', async () => {
    let secondPage = [olderActiveOrder];
    mockOpenmrsFetch.mockImplementation((url: string) =>
      Promise.resolve(url.includes('startIndex=50') ? page(secondPage) : page(recentPastOrders, nextPageUri)),
    );

    const { result } = renderHook(
      () => ({
        medicationOrders: useMedicationOrders(mockPatient.id),
        mutateOrders: useMutatePatientOrders(mockPatient.id).mutate,
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.medicationOrders.activeOrders).toHaveLength(1));

    secondPage = [olderActiveOrder, drugOrder('second-active', { dateActivated: '2020-01-14T08:00:00.000+0000' })];
    await act(() => result.current.mutateOrders());

    await waitFor(() => expect(result.current.medicationOrders.activeOrders).toHaveLength(2));
  });

  it('keeps the loaded orders when a background refresh fails', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce(page([olderActiveOrder]));
    const { result } = renderHook(() => useMedicationOrders(mockPatient.id), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <SWRConfig
          value={{
            dedupingInterval: 0,
            focusThrottleInterval: 0,
            shouldRetryOnError: false,
            provider: () => new Map(),
          }}
        >
          {children}
        </SWRConfig>
      ),
    });
    await waitFor(() => expect(result.current.activeOrders).toHaveLength(1));

    mockOpenmrsFetch.mockRejectedValue(new Error('Server error'));
    // SWR only listens for focus once it has mounted.
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.activeOrders).toHaveLength(1);
  });

  it('holds the orders back until every page has loaded', async () => {
    let resolveSecondPage: (response: Awaited<ReturnType<typeof openmrsFetch>>) => void;
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecondPage = resolve)));

    const { result } = renderHook(() => useMedicationOrders(mockPatient.id), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.pastOrders).toEqual([]);

    await act(async () => resolveSecondPage(page([olderActiveOrder])));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pastOrders).toHaveLength(50);
  });

  it('does not fetch orders without a patient', () => {
    renderHook(() => useMedicationOrders(''), { wrapper });

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });
});
