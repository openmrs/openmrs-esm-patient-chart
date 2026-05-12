import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import DrugSearchComboBox from './drug-search-combobox.component';
import { useDrugSearch, useDrugTemplates } from './drug-search.resource';
import React from 'react';
import { mockDrugSearchResultApiData } from '__mocks__';

const mockUseDrugSearch = vi.mocked(useDrugSearch);
const mockUseDrugTemplates = vi.mocked(useDrugTemplates);

vi.mock('./drug-search.resource', async () => ({
  ...((await vi.importActual('./drug-search.resource')) as object),
  useDrugSearch: vi.fn(),
  useDrugTemplates: vi.fn(),
}));

const mockSetSelectedDrugItem = vi.fn();

describe('DrugSearchComboBox', () => {
  beforeEach(() => {
    mockUseDrugSearch.mockImplementation(() => ({
      isLoading: false,
      drugs: mockDrugSearchResultApiData,
      error: null,
      isValidating: false,
      mutate: vi.fn(),
    }));

    mockUseDrugTemplates.mockImplementation(() => ({
      isLoading: false,
      error: null,
      templateByDrugUuid: new Map(),
      isValidating: false,
      mutate: vi.fn(),
    }));
  });

  it('renders DrugSearchComboBox', async () => {
    const user = userEvent.setup();
    renderDrugSearchComboBox();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    await user.type(screen.getByRole('combobox'), 'Aspirin');
    const aspirin81 = screen.getByText(/Aspirin 81mg/i);
    expect(aspirin81).toBeInTheDocument();
    await aspirin81.click();
    expect(mockSetSelectedDrugItem).toHaveBeenCalledWith(
      expect.objectContaining({
        display: 'Aspirin 81mg',
      }),
    );
  });
});

function renderDrugSearchComboBox() {
  render(
    <DrugSearchComboBox initialOrderBasketItem={null} setSelectedDrugItem={mockSetSelectedDrugItem} visit={null} />,
  );
}
