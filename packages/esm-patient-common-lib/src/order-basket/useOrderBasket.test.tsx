import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useOrderBasket } from './useOrderBasket';
import { OrderBasketItem } from './types';

jest.mock('../get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => 'test-patient-uuid'),
}));

const mockOrderBasketItem = {
  action: 'NEW',
  commonMedicationName: 'test',
} as OrderBasketItem;

describe('useOrderBasket', () => {
  it('returns the correct list of orders given a grouping', () => {
    const { result } = renderHook(() => useOrderBasket('medications'));
    expect(result.current.orders).toEqual([]);
    act(() => {
      result.current.setOrders([mockOrderBasketItem]);
    });
    expect(result.current.orders).toEqual([mockOrderBasketItem]);
  });
});
