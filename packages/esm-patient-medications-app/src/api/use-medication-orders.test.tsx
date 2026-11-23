import React from 'react';
import { SWRConfig } from 'swr';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type Order, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../config-schema';
import { fetchAllOrders, useMedicationOrders } from './api';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

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

describe('fetchAllOrders', () => {
  it('returns the results of a single page when there is no next link', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce(page([drugOrder('only')]));

    const orders = await fetchAllOrders(ordersPath);

    expect(orders.map((order) => order.uuid)).toEqual(['only']);
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
  });

  it('follows next links until every page has been fetched', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockResolvedValueOnce(page([olderActiveOrder]));

    const orders = await fetchAllOrders(ordersPath);

    expect(orders).toHaveLength(51);
    expect(orders.at(-1).uuid).toBe('older-active');
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
  });

  it('requests later pages from the current origin so frontend proxies keep working', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockResolvedValueOnce(page([olderActiveOrder]));

    await fetchAllOrders(ordersPath);

    const nextUrl = new URL(mockOpenmrsFetch.mock.calls[1][0] as string);
    expect(nextUrl.host).toBe(window.location.host);
    expect(nextUrl.protocol).toBe(window.location.protocol);
    expect(nextUrl.pathname).toBe(`/openmrs${restBaseUrl}/order`);
    expect(nextUrl.searchParams.get('startIndex')).toBe('50');
  });

  it("doesn't keep the port from a next link that points at another host", async () => {
    // A chart served without a port, behind a proxy that passes on the backend's own host and port.
    vi.stubGlobal('location', new URL('https://emr.example.org/openmrs/spa/patient/123/chart'));
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, `http://backend:8080/openmrs${ordersPath}&startIndex=50`))
      .mockResolvedValueOnce(page([olderActiveOrder]));

    try {
      await fetchAllOrders(ordersPath);
    } finally {
      vi.unstubAllGlobals();
    }

    expect(mockOpenmrsFetch.mock.calls[1][0]).toBe(`https://emr.example.org/openmrs${ordersPath}&startIndex=50`);
  });

  it('fails when a later page fails, instead of returning an incomplete list', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockRejectedValueOnce(new Error('Server error'));

    await expect(fetchAllOrders(ordersPath)).rejects.toThrow('Server error');
  });
});

describe('useMedicationOrders', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ drugOrderTypeUUID } as ConfigObject);
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

  it('reports an error when a later page fails', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce(page(recentPastOrders, nextPageUri))
      .mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useMedicationOrders(mockPatient.id), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.isLoading).toBe(false);
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

  it('does not fetch orders without a patient', () => {
    renderHook(() => useMedicationOrders(''), { wrapper });

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });
});
