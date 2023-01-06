import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getByTextWithMarkup } from '../../../../../tools/test-helpers';
import { mockDrugOrderTemplates, mockDrugSearchResultItems } from '../../../../../__mocks__/medication.mock';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search.resource';
import OrderBasketSearchResults from './order-basket-search-results.component';

const testProps = {
  encounterUuid: '',
  onSearchResultClicked: jest.fn(),
  searchTerm: 'aspirin',
  setSearchTerm: jest.fn(),
};

jest.mock('./drug-search.resource', () => ({
  ...jest.requireActual('./drug-search.resource'),
  useDrugSearch: jest.fn(),
  useDrugTemplate: jest.fn(),
}));

describe('OrderBasketSearchResults', () => {
  test('renders matching orders as clickable tiles after searching for a drug order', async () => {
    const user = userEvent.setup();

    (useDrugSearch as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      drugs: mockDrugSearchResultItems,
      error: null,
    }));

    (useDrugTemplate as jest.Mock).mockImplementation((drugUuid) => ({
      templates: mockDrugOrderTemplates[drugUuid] ?? [],
      isLoading: false,
      error: false,
    }));

    const mockDate = new Date(1466424490000);
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate.toISOString());

    renderOrderBasketSearchResults();

    await screen.findAllByRole('listitem');
    expect(screen.getAllByRole('listitem').length).toEqual(4);
    // Anotates results with dosing info if an order-template was found.
    expect(getByTextWithMarkup(/Aspirin — 81mg — Tablet/i)).toBeInTheDocument();
    // Only displays drug name for results without a matching order template
    expect(getByTextWithMarkup(/Aspirin — 325mg — Tablet/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Aspirin — 162.5mg — Tablet/i)).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /Immediately add to basket/i }).length).toEqual(4);

    await waitFor(() => user.click(screen.getAllByRole('listitem')[0]));

    expect(testProps.onSearchResultClicked).toHaveBeenCalledWith(
      getTemplateOrderBasketItem(
        mockDrugSearchResultItems[0],
        undefined,
        mockDrugOrderTemplates[mockDrugSearchResultItems[0].uuid][0],
      ),
      false,
    );
  });
});

function renderOrderBasketSearchResults() {
  render(<OrderBasketSearchResults {...testProps} />);
}
