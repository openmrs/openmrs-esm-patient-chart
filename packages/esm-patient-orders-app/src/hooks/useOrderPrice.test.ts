import { act, renderHook } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type OrderPriceData } from '../types/order';
import { useOrderPrice } from './useOrderPrice';
import { mockOrderPriceData } from '../../../../__mocks__/order-price-data.mock';

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

describe('useOrderPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null data when orderItemUuid is not provided', () => {
    const { result } = renderHook(() => useOrderPrice(''));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(mockedOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('fetches and returns price data successfully', async () => {
    const mockPromise = Promise.resolve({
      data: mockOrderPriceData,
    } as unknown as FetchResponse<OrderPriceData>);
    mockedOpenmrsFetch.mockReturnValue(mockPromise);

    const { result } = renderHook(() => useOrderPrice('test-uuid'));

    expect(result.current.data).toBeNull();

    await act(async () => {
      await mockPromise;
    });

    expect(result.current.data).toEqual(mockOrderPriceData);
    expect(result.current.isLoading).toBeFalsy();
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('/ws/fhir2/R4/ChargeItemDefinition?code=test-uuid');
  });
});
