import { act, renderHook } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type OrderStockData } from '../types/order';
import { useOrderStockInfo } from './useOrderStockInfo';
import { mockOrderStockData } from '../../../../__mocks__/order-stock-data.mock';

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

describe('useOrderStockInfo', () => {
  beforeEach(() => {
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              { uuid: 'stockmanagement', display: 'Stock Management' },
            ],
          },
        } as FetchResponse);
      }
      return Promise.resolve({ data: null } as FetchResponse<OrderStockData>);
    });
  });

  it('returns null data when orderItemUuid is not provided', () => {
    const { result } = renderHook(() => useOrderStockInfo(''));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it('fetches and returns stock data when required modules are installed', async () => {
    const mockStockPromise = Promise.resolve({
      data: mockOrderStockData,
    } as FetchResponse<OrderStockData>);

    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              { uuid: 'stockmanagement', display: 'Stock Management' },
            ],
          },
        } as FetchResponse);
      }
      return mockStockPromise;
    });

    const { result } = renderHook(() => useOrderStockInfo('test-uuid'));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeTruthy();

    await act(async () => {
      await mockStockPromise;
    });

    expect(result.current.data).toEqual(mockOrderStockData);
    expect(result.current.isLoading).toBeFalsy();
  });

  it('does not fetch stock data when required modules are not installed', async () => {
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.includes('/ws/rest/v1/module')) {
        return Promise.resolve({
          data: {
            results: [
              { uuid: 'fhirproxy', display: 'FHIR Proxy' },
              // stockmanagement module missing
            ],
          },
        } as FetchResponse);
      }
      return Promise.resolve({ data: null } as FetchResponse<OrderStockData>);
    });

    const { result } = renderHook(() => useOrderStockInfo('test-uuid-2'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
  });

  it('handles module check error gracefully', async () => {
    mockedOpenmrsFetch.mockRejectedValueOnce(new Error('Failed to fetch modules'));

    const { result } = renderHook(() => useOrderStockInfo('test-uuid-2'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
  });
});
