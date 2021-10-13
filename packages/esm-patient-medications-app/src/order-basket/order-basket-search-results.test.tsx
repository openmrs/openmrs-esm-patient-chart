import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockMedicationOrderSearchResults } from '../../../../__mocks__/medication.mock';
import OrderBasketSearchResults from './order-basket-search-results.component';
import { searchMedications } from './drug-search';
import { paginate } from '../utils/pagination';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import userEvent from '@testing-library/user-event';

const mockPaginate = paginate as jest.Mock;
const mockSearchMedications = searchMedications as jest.Mock;

const testProps = {
  encounterUuid: '',
  onSearchResultClicked: jest.fn(),
  searchTerm: 'aspirin',
  setSearchTerm: jest.fn(),
};

jest.mock('./drug-search', () => ({
  searchMedications: jest.fn(),
  searchDrugsInBackend: jest.fn(),
  explodeDrugResultWithCommonMedicationData: jest.fn(),
  filterExplodedResultsBySearchTerm: jest.fn(),
  includesIgnoreCase: jest.fn(),
}));

jest.mock('../utils/pagination', () => ({
  paginate: jest.fn(),
}));

describe('OrderBasketSearchResults: ', () => {
  test('renders matching orders as clickable tiles after searching for a drug order', async () => {
    mockSearchMedications.mockResolvedValue(mockMedicationOrderSearchResults);
    mockPaginate.mockReturnValue([mockMedicationOrderSearchResults]);

    renderOrderBasketSearchResults();

    await screen.findAllByRole('listitem');
    expect(screen.getAllByRole('listitem').length).toEqual(3);
    expect(getByTextWithMarkup(/Aspirin — 81 mg — Tablet\s*Once daily — Oral/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Aspirin — 162 mg — Tablet\s*Once daily — Oral/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Aspirin — 243 mg — Tablet\s*Once daily — Oral/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Immediately add to basket/i }).length).toEqual(3);

    userEvent.click(screen.getAllByRole('listitem')[0]);
    expect(testProps.onSearchResultClicked).toHaveBeenCalledWith(mockMedicationOrderSearchResults[0], false);
  });
});

function renderOrderBasketSearchResults() {
  render(<OrderBasketSearchResults {...testProps} />);
}
