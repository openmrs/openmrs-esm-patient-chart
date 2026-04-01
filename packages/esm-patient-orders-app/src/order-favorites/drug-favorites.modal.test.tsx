import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { renderWithSwr } from 'tools';
import DrugFavoritesModal from './drug-favorites.modal';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

jest.mock('./useFavoritesActions', () => ({
  useFavoritesActions: jest.fn(),
}));

const mockUseFavoritesActions = jest.mocked(useFavoritesActions);
const mockUseConfig = jest.mocked(useConfig);
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

const mockDrug: Drug = {
  uuid: 'drug-1',
  display: 'Aspirin 81mg Tablet',
  strength: '81mg',
  dosageForm: { display: 'Tablet', uuid: 'form-1' },
  concept: { uuid: 'concept-1', display: 'Aspirin' },
} as Drug;

const defaultActions = {
  favorites: [] as DrugFavoriteOrder[],
  isLoading: false,
  deleteMultipleFavorites: jest.fn(),
  persistFavorites: jest.fn().mockResolvedValue(true),
  error: undefined,
};

beforeAll(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: { ...globalThis.crypto, randomUUID: jest.fn(() => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee') },
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConfig.mockReturnValue({ enableDrugOrderFavorites: true, maxPinnedDrugOrders: 50 });
  mockUseFavoritesActions.mockReturnValue(defaultActions);
  mockedOpenmrsFetch.mockImplementation((url: string) => {
    if (url.includes('/orderentryconfig')) {
      return Promise.resolve({
        data: {
          drugRoutes: [{ uuid: 'route-1', display: 'Oral' }],
          drugDosingUnits: [{ uuid: 'unit-1', display: 'mg' }],
          orderFrequencies: [{ uuid: 'freq-1', display: 'Once daily' }],
        },
      } as FetchResponse);
    }
    if (url.includes('/drug?q=')) {
      return Promise.resolve({
        data: { results: [mockDrug] },
      } as FetchResponse);
    }
    return Promise.resolve({ data: null } as FetchResponse);
  });
});

describe('DrugFavoritesModal', () => {
  it('shows "Add order to my pinned orders" title', () => {
    renderWithSwr(<DrugFavoritesModal closeModal={jest.fn()} drug={mockDrug} />);
    expect(screen.getByText('Add order to my pinned orders')).toBeInTheDocument();
  });

  it('shows manual dose input when "Add dose" is clicked', async () => {
    const user = userEvent.setup();
    renderWithSwr(
      <DrugFavoritesModal closeModal={jest.fn()} drug={mockDrug} initialAttributes={{ strength: '81mg' }} />,
    );

    await user.click(screen.getByText(/Add dose/i));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders strength dropdown for concept-based favorites', async () => {
    const conceptDrug = {
      ...mockDrug,
      uuid: undefined,
      strength: undefined,
    } as unknown as Drug;

    renderWithSwr(<DrugFavoritesModal closeModal={jest.fn()} drug={conceptDrug} />);

    expect(await screen.findByText('Strength')).toBeInTheDocument();
  });
});
