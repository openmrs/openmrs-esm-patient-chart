import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabOrderBasketPanel from './lab-order-basket-panel.extension';
import { type LabOrderBasketItem, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';

const mockUseOrderBasket = jest.fn();

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderBasket: () => mockUseOrderBasket(),
}));

describe('LabOrderBasketPanel', () => {
  test('renders an empty state when no items are selected in the order basket', () => {
    mockUseOrderBasket.mockReturnValue({ orders: [] });
    render(<LabOrderBasketPanel />);
    expect(screen.getByRole('heading', { name: /Lab orders \(0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of lab orders', async () => {
    const user = userEvent.setup();
    const labs: Array<LabOrderBasketItem> = [
      {
        action: 'NEW',
        testType: {
          conceptUuid: 'test-lab-uuid-1',
          label: 'HIV VIRAL LOAD',
        },
        display: 'HIV VIRAL LOAD',
        urgency: 'ROUTINE',
        uuid: 'order-uuid-1',
      },
      {
        action: 'NEW',
        testType: {
          conceptUuid: 'test-lab-uuid-2',
          label: 'CD4 COUNT',
        },
        display: 'CD4 COUNT',
        urgency: 'STAT',
        uuid: 'order-uuid-2',
      },
    ];
    let orders = [...labs];
    const mockSetOrders = jest.fn((newOrders: Array<OrderBasketItem>) => {
      orders = newOrders;
    });
    mockUseOrderBasket.mockImplementation(() => ({
      orders: orders,
      setOrders: mockSetOrders,
    }));
    const { rerender } = render(<LabOrderBasketPanel />);
    expect(screen.getByText(/Lab orders \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/HIV VIRAL LOAD/i)).toBeInTheDocument();
    expect(screen.getByText(/CD4 COUNT/i)).toBeInTheDocument();
    const removeHivButton = screen.getAllByRole('button', { name: /remove from basket/i })[0];
    expect(removeHivButton).toBeVisible();
    await user.click(removeHivButton);
    rerender(<LabOrderBasketPanel />); // re-render because the mocked hook does not trigger a render
    await expect(screen.getByText(/Lab orders \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CD4 COUNT/i)).toBeInTheDocument();
    expect(screen.queryByText(/HIV VIRAL LOAD/i)).not.toBeInTheDocument();
  });
});
