import { act, renderHook } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type OrderPriceData } from '../types/order';
import { useOrderPrice } from './useOrderPrice';
import { mockOrderPriceData } from '../../../../__mocks__/order-price-data.mock';

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

describe('useOrderPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              { uuid: 'billing', display: 'Billing Module' },
            ],
          },
        } as FetchResponse);
      }
      return Promise.resolve({ data: null } as FetchResponse<OrderPriceData>);
    });
  });

  it('returns null data when orderItemUuid is not provided', () => {
    const { result } = renderHook(() => useOrderPrice(''));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it('fetches and returns price data when required modules are installed', async () => {
    const mockPricePromise = Promise.resolve({
      data: mockOrderPriceData,
    } as FetchResponse<OrderPriceData>);

    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              { uuid: 'billing', display: 'Billing Module' },
            ],
          },
        } as FetchResponse);
      }
      return mockPricePromise;
    });

    const { result } = renderHook(() => useOrderPrice('test-uuid'));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeTruthy();

    await act(async () => {
      await mockPricePromise;
    });

    expect(result.current.data).toEqual(mockOrderPriceData);
    expect(result.current.isLoading).toBeFalsy();
  });

  it('does not fetch price data when required modules are not installed', async () => {
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              // billing module missing
            ],
          },
        } as FetchResponse);
      }
      return Promise.resolve({ data: null } as FetchResponse<OrderPriceData>);
    });

    const { result } = renderHook(() => useOrderPrice('test-uuid-2'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
  });

  it('handles module check error gracefully', async () => {
    mockedOpenmrsFetch.mockRejectedValueOnce(new Error('Failed to fetch modules'));

    const { result } = renderHook(() => useOrderPrice('test-uuid-2'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
  });
});
