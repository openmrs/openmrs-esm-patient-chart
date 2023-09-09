import { act, renderHook } from '@testing-library/react';
import { useOrderBasket } from './useOrderBasket';
import { OrderBasketItem, PostDataPrepFunction } from './types';
import { _resetOrderBasketStore } from './store';

jest.mock('../get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => 'test-patient-uuid'),
}));

const mockDrugOrderBasketItem = {
  action: 'NEW',
  uuid: 'mock-drug-uuid',
} as OrderBasketItem;

const mockLabOrderBasketItem = {
  action: 'NEW',
  uuid: 'mock-lab-uuid',
} as OrderBasketItem;

describe('useOrderBasket', () => {
  beforeEach(() => {
    _resetOrderBasketStore();
  });

  it('returns the correct list of orders given a grouping', () => {
    const { result } = renderHook(() => useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction));
    expect(result.current.orders).toEqual([]);
    act(() => {
      result.current.setOrders([mockDrugOrderBasketItem]);
    });
    expect(result.current.orders).toEqual([mockDrugOrderBasketItem]);
  });

  it('can modify items in one grouping without affecting the other', () => {
    const { result: drugResult } = renderHook(() =>
      useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction),
    );
    const { result: labResult } = renderHook(() =>
      useOrderBasket('labs', ((x) => x) as unknown as PostDataPrepFunction),
    );
    expect(drugResult.current.orders).toEqual([]);
    expect(labResult.current.orders).toEqual([]);
    act(() => {
      drugResult.current.setOrders([mockDrugOrderBasketItem]);
    });
    expect(drugResult.current.orders).toEqual([mockDrugOrderBasketItem]);
    expect(labResult.current.orders).toEqual([]);
    act(() => {
      labResult.current.setOrders([mockLabOrderBasketItem]);
    });
    expect(drugResult.current.orders).toEqual([mockDrugOrderBasketItem]);
    expect(labResult.current.orders).toEqual([mockLabOrderBasketItem]);
  });
});
