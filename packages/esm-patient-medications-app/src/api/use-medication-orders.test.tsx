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

function page(results: Array<Order>) {
  return {
    data: { results, links: [] },
  } as unknown as Awaited<ReturnType<typeof openmrsFetch>>;
}

const olderActiveOrder = drugOrder('older-active', { dateActivated: '2020-01-15T08:00:00.000+0000' });

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
