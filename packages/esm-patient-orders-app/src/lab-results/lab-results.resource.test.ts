import { vi, describe, expect, test, beforeEach } from 'vitest';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { completeOrderWithSavedResults, updateOrderResult } from './lab-results.resource';
import { type OrderDiscontinuationPayload } from '../types/order';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const obsPayload = {
  obs: [{ concept: { uuid: 'concept-uuid' }, order: { uuid: 'order-uuid' }, status: 'FINAL', value: 12.5 }],
};
const fulfillerPayload = { fulfillerStatus: 'COMPLETED', fulfillerComment: 'Test Results Entered' };
const orderPayload = {
  previousOrder: 'order-uuid',
  type: 'testorder',
  action: 'DISCONTINUE',
  careSetting: 'care-setting-uuid',
  encounter: 'encounter-uuid',
  patient: 'patient-uuid',
  concept: 'concept-uuid',
  orderer: { uuid: 'orderer-uuid', display: 'Orderer', person: { display: 'Orderer' } },
} satisfies OrderDiscontinuationPayload;

const requestedUrls = () => mockOpenmrsFetch.mock.calls.map(([url]) => url);

describe('updateOrderResult', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as FetchResponse);
  });

  test('saves the results and discontinues the order in one encounter request, then marks the order as fulfilled', async () => {
    await updateOrderResult(
      'order-uuid',
      'encounter-uuid',
      obsPayload,
      fulfillerPayload,
      orderPayload,
      new AbortController(),
    );

    expect(requestedUrls()).toEqual([
      `${restBaseUrl}/encounter/encounter-uuid`,
      `${restBaseUrl}/order/order-uuid/fulfillerdetails/`,
    ]);
    expect(mockOpenmrsFetch.mock.calls[0][1]).toEqual(
      expect.objectContaining({ method: 'POST', body: { ...obsPayload, orders: [orderPayload] } }),
    );
    expect(mockOpenmrsFetch.mock.calls[1][1]).toEqual(
      expect.objectContaining({ method: 'POST', body: fulfillerPayload }),
    );
  });

  test('does not mark the order as fulfilled when saving the results fails', async () => {
    mockOpenmrsFetch.mockRejectedValueOnce(new Error('Internal Server Error'));

    await expect(
      updateOrderResult(
        'order-uuid',
        'encounter-uuid',
        obsPayload,
        fulfillerPayload,
        orderPayload,
        new AbortController(),
      ),
    ).rejects.toThrow('Internal Server Error');

    expect(requestedUrls()).toEqual([`${restBaseUrl}/encounter/encounter-uuid`]);
  });
});

describe('completeOrderWithSavedResults', () => {
  const mockSavedOrder = (dateStopped: string | null) => {
    mockOpenmrsFetch.mockImplementation((url) =>
      Promise.resolve({
        data: url.startsWith(`${restBaseUrl}/order/order-uuid?`) ? { uuid: 'order-uuid', dateStopped } : {},
      } as FetchResponse),
    );
  };

  test('discontinues the order and marks it as fulfilled when the order is still active', async () => {
    mockSavedOrder(null);

    await completeOrderWithSavedResults('order-uuid', fulfillerPayload, orderPayload, new AbortController());

    expect(requestedUrls()).toEqual([
      `${restBaseUrl}/order/order-uuid?v=custom:(uuid,dateStopped)`,
      `${restBaseUrl}/order`,
      `${restBaseUrl}/order/order-uuid/fulfillerdetails/`,
    ]);
    expect(mockOpenmrsFetch.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'POST', body: orderPayload }));
  });

  test('only marks the order as fulfilled when the order was already discontinued', async () => {
    mockSavedOrder('2026-09-23T19:50:15.000+0000');

    await completeOrderWithSavedResults('order-uuid', fulfillerPayload, orderPayload, new AbortController());

    expect(requestedUrls()).toEqual([
      `${restBaseUrl}/order/order-uuid?v=custom:(uuid,dateStopped)`,
      `${restBaseUrl}/order/order-uuid/fulfillerdetails/`,
    ]);
  });
});
