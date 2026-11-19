import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import OrderBasketItemTile from './order-basket-item-tile.component';

const procedureOrder = {
  action: 'NEW',
  display: 'Chest X-ray',
  concept: { uuid: 'chest-x-ray-uuid', display: 'Chest X-ray' },
} as OrderBasketItem;

function renderTile(orderBasketItem: OrderBasketItem) {
  render(<OrderBasketItemTile orderBasketItem={orderBasketItem} onItemClick={vi.fn()} onRemoveClick={vi.fn()} />);
}

describe('OrderBasketItemTile', () => {
  it('labels an order that has not been signed yet as new', () => {
    renderTile(procedureOrder);

    expect(screen.getByRole('status', { name: 'New' })).toBeInTheDocument();
  });

  it('labels an order the server rejected as failed and shows the reason', () => {
    renderTile({
      ...procedureOrder,
      orderError: Object.assign(new Error('Forbidden'), {
        responseBody: { error: { message: 'Privileges required: Add Orders' } },
      }),
    });

    expect(screen.getByRole('status', { name: 'Failed' })).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'New' })).not.toBeInTheDocument();
    expect(screen.getByText(/Privileges required: Add Orders/)).toBeInTheDocument();
  });
});
