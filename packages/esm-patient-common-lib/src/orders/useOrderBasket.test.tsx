import { act, renderHook } from '@testing-library/react';
import { useOrderBasket } from './useOrderBasket';
import { OrderBasketItem } from './types';
import { PostDataPrepFunction } from './store';

jest.mock('../get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => 'test-patient-uuid'),
}));

const mockOrderBasketItem = {
  action: 'NEW',
  commonMedicationName: 'test',
} as OrderBasketItem;

describe('useOrderBasket', () => {
  it('returns the correct list of orders given a grouping', () => {
    const { result } = renderHook(() => useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction));
    expect(result.current.orders).toEqual([]);
    act(() => {
      result.current.setOrders([mockOrderBasketItem]);
    });
    expect(result.current.orders).toEqual([mockOrderBasketItem]);
  });
});
