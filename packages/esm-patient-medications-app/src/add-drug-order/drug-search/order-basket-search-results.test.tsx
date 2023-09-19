import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getByTextWithMarkup } from '../../../../../tools/test-helpers';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search.resource';
import OrderBasketSearchResults from './order-basket-search-results.component';
import { mockDrugSearchResultApiData, mockDrugOrderTemplateApiData } from '../../__mocks__/medication.mock';

jest.mock('./drug-search.resource', () => ({
  ...jest.requireActual('./drug-search.resource'),
  useDrugSearch: jest.fn(),
  useDrugTemplate: jest.fn(),
}));

const testProps = {
  searchTerm: 'aspirin',
  onSearchTermClear: jest.fn(),
  onSearchResultClicked: jest.fn(),
  focusAndClearSearchInput: jest.fn(),
};

function renderOrderBasketSearchResults() {
  render(<OrderBasketSearchResults {...testProps} />);
}

describe('OrderBasketSearchResults', () => {
  test('renders matching orders as clickable tiles after searching for a drug order', async () => {
    const user = userEvent.setup();

    (useDrugSearch as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      drugs: mockDrugSearchResultApiData,
      error: null,
    }));

    (useDrugTemplate as jest.Mock).mockImplementation((drugUuid) => ({
      templates: mockDrugOrderTemplateApiData[drugUuid] ?? [],
      isLoading: false,
      error: false,
    }));

    const mockDate = new Date(1466424490000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate.toISOString());

    renderOrderBasketSearchResults();

    await screen.findAllByRole('listitem');
    expect(screen.getAllByRole('listitem').length).toEqual(3);
    // Anotates results with dosing info if an order-template was found.
    const aspirin81 = getByTextWithMarkup(/Aspirin 81mg/i);
    expect(aspirin81).toBeInTheDocument();
    expect(aspirin81.closest('div')).toHaveTextContent(/Aspirin.*81mg.*tablet.*twice daily.*oral/i);
    // Only displays drug name for results without a matching order template
    const aspirin325 = getByTextWithMarkup(/Aspirin 325mg/i);
    expect(aspirin325).toBeInTheDocument();
    expect(aspirin325.closest('div')).toHaveTextContent(/Aspirin.*325mg.*tablet/i);
    const asprin162 = screen.getByText(/Aspirin 162.5mg/i);
    expect(asprin162).toBeInTheDocument();
    expect(asprin162.closest('div')).toHaveTextContent(/Aspirin.*162.5mg.*tablet/i);

    expect(screen.getAllByRole('button', { name: /Immediately add to basket/i }).length).toEqual(3);

    await waitFor(() => user.click(screen.getAllByRole('listitem')[0]));

    expect(testProps.onSearchResultClicked).toHaveBeenCalledWith(
      getTemplateOrderBasketItem(
        mockDrugSearchResultApiData[0],
        undefined,
        mockDrugOrderTemplateApiData[mockDrugSearchResultApiData[0].uuid][0],
      ),
    );
  });
});
