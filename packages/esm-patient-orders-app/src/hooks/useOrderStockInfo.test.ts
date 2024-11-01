import { act, renderHook } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type OrderStockData } from '../types/order';
import { useOrderStockInfo } from './useOrderStockInfo';
import { mockOrderStockData } from '../../../../__mocks__/order-stock-data.mock';

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

describe('useOrderStockInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null data when orderItemUuid is not provided', () => {
    const { result } = renderHook(() => useOrderStockInfo(''));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(mockedOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('fetches and returns stock data successfully', async () => {
    const mockPromise = Promise.resolve({
      data: mockOrderStockData,
    } as unknown as FetchResponse<OrderStockData>);
    mockedOpenmrsFetch.mockReturnValue(mockPromise);

    const { result } = renderHook(() => useOrderStockInfo('test-uuid'));

    expect(result.current.data).toBeNull();

    await act(async () => {
      await mockPromise;
    });

    expect(result.current.data).toEqual(mockOrderStockData);
    expect(result.current.isLoading).toBeFalsy();
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('/ws/fhir2/R4/InventoryItem?code=test-uuid');
  });
});
