import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderBasketSearch from './order-basket-search.component';

const testProps = {
  encounterUuid: '',
  onSearchResultClicked: () => {},
};

describe('OrderBasketSearch: ', () => {
  test('renders a medication orders search input', () => {
    renderOrderBasketSearch();

    const searchbox = screen.getByRole('searchbox', { name: /search for an order \(e.g. "Aspirin"\)/i });
    expect(searchbox).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();

    userEvent.type(searchbox, 'Aspirin');
    expect(searchbox).toHaveDisplayValue('Aspirin');
    expect(screen.getByText(/exact match\(es\)/i)).toBeInTheDocument();
  });

  test('renders a light background in the search input in the tablet viewport', () => {
    testProps.isTablet = true;

    renderOrderBasketSearch();

    const searchInput = screen.getByRole('search', { name: /search for an order \(e.g. "Aspirin"\)/i });
    expect(searchInput).toHaveClass('bx--search--light', { exact: false });
  });
});

function renderOrderBasketSearch() {
  render(<OrderBasketSearch {...testProps} />);
}
