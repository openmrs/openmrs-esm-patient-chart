import React from 'react';
import { screen, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import { mockDrugSearchResultApiData, mockPatientDrugOrdersApiData, patientUuid } from '../__mocks__/medication.mock';
import DrugOrderBasketPanel from './drug-order-basket-panel.extension';
import { getTemplateOrderBasketItem } from '../add-drug-order/drug-search/drug-search.resource';
import { DrugOrderBasketItem } from '../types';

const mockUseOrderBasket = jest.fn();

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderBasket: () => mockUseOrderBasket(),
}));

describe('OrderBasketPanel: ', () => {
  test('renders an empty state when no items are selected in the order basket', () => {
    mockUseOrderBasket.mockReturnValue({ orders: [] });
    render(<DrugOrderBasketPanel />);
    expect(screen.getByRole('heading', { name: /Drug orders \(0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of orders, including new, renewing, modifying, and discontinuing', async () => {
    const user = userEvent.setup();
    const medications = [
      getTemplateOrderBasketItem(mockDrugSearchResultApiData[0]),
      ...mockPatientDrugOrdersApiData.slice(0, 3),
    ] as Array<DrugOrderBasketItem>;
    medications[1].action = 'REVISE';
    medications[2].action = 'RENEW';
    medications[3].action = 'DISCONTINUE';
    let orders = [...medications];
    const mockSetOrders = jest.fn((newOrders: Array<DrugOrderBasketItem>) => {
      orders = newOrders;
    });
    mockUseOrderBasket.mockImplementation(() => ({
      orders: orders,
      setOrders: mockSetOrders,
    }));
    const { rerender } = render(<DrugOrderBasketPanel />);
    expect(screen.getByText(/Drug orders \(4\)/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/New\s*Aspirin 81mg — 81mg — Tablet/i)).toBeVisible();
    expect(getByTextWithMarkup(/DOSE\s*Tablet.*— REFILLS 0 QUANTITY 0/i)).toBeVisible();
    expect(getByTextWithMarkup(/Renew\s*Sulfacetamide 0.1 — 10%/i)).toBeVisible();
    expect(getByTextWithMarkup(/Modify\s*Aspirin 162.5mg — 162.5mg — tablet/i)).toBeVisible();
    expect(getByTextWithMarkup(/Discontinue\s*Acetaminophen 325 mg — 325mg — tablet/i)).toBeVisible();
    const aspirin81 = getByTextWithMarkup(/New\s*Aspirin 81mg — 81mg — Tablet/i).closest('div');
    const removeAspirin81Button = within(aspirin81).getByRole('button', { name: /remove from basket/i });
    expect(removeAspirin81Button).toBeVisible();
    await waitFor(() => user.click(removeAspirin81Button));
    rerender(<DrugOrderBasketPanel />); // re-render because the mocked hook does not trigger a render
    await waitFor(() => expect(screen.getByText(/Drug Orders \(3\)/i)).toBeInTheDocument());
  });
});
