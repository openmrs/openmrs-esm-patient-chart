import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import { mockMedicationOrderSearchResults } from '../../../../__mocks__/medication.mock';
import OrderBasketItemList from './order-basket-item-list.component';

const mockOnItemClicked = jest.fn();
const mockOnItemRemoved = jest.fn();

const testProps = {
  orderBasketItems: [],
  onItemClicked: mockOnItemClicked,
  onItemRemoveClicked: mockOnItemRemoved,
};

describe('OrderBasketItemList: ', () => {
  test('renders an empty state when no items are selected in the order basket', () => {
    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /Order basket/i })).toBeInTheDocument();
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Search for an order above/i)).toBeInTheDocument();
  });

  test('renders a tile-based layout of newly added orders when available', async () => {
    const user = userEvent.setup();

    testProps.orderBasketItems = mockMedicationOrderSearchResults.slice(0, 1);

    renderOrderBasketItemList();

    const orderBasketItem = screen.getByRole('listitem');
    expect(orderBasketItem).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /item\(s\) already in your basket/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/New\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();

    const removeFromBasketButton = screen.getByRole('button', { name: /remove from basket/i });
    expect(removeFromBasketButton).toBeInTheDocument();

    await waitFor(() => user.click(removeFromBasketButton));

    expect(mockOnItemRemoved).toHaveBeenCalledTimes(1);
    expect(mockOnItemRemoved).toHaveBeenCalledWith(testProps.orderBasketItems[0]);
  });

  test('renders a tile-based layout of renewed orders when available', () => {
    testProps.orderBasketItems[0].action = 'RENEWED';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /order\(s\) being renewed/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Renew\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of revised orders when available', () => {
    testProps.orderBasketItems[0].action = 'REVISE';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /order\(s\) being modified \(revised\)/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Modify\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of discontinued orders when available', () => {
    testProps.orderBasketItems[0].action = 'DISCONTINUE';

    renderOrderBasketItemList();

    expect(screen.getByRole('heading', { name: /discontinued order\(s\)/i })).toBeInTheDocument();
    expect(getByTextWithMarkup(/Discontinue\s*Aspirin — 81 mg — Tablet/)).toBeInTheDocument();
    expect(getByTextWithMarkup(/DOSE 81 mg — Oral — Once daily — REFILLS 0 QUANTITY 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from basket/i })).toBeInTheDocument();
  });
});

function renderOrderBasketItemList() {
  render(<OrderBasketItemList {...testProps} />);
}
