import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import DrugActionsMenu from './drug-actions-menu.component';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

jest.mock('./useFavoritesActions', () => ({
  useFavoritesActions: jest.fn(),
}));

const mockUseFavoritesActions = jest.mocked(useFavoritesActions);
const mockUseConfig = jest.mocked(useConfig);
const mockShowModal = jest.mocked(showModal);

const mockDrug: Drug = {
  uuid: 'drug-1',
  display: 'Aspirin 81mg',
  strength: '81mg',
  concept: { uuid: 'concept-1', display: 'Aspirin' },
} as Drug;

const defaultActions = {
  favorites: [] as DrugFavoriteOrder[],
  isLoading: false,
  deleteMultipleFavorites: jest.fn(),
  persistFavorites: jest.fn(),
  error: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConfig.mockReturnValue({ enableDrugOrderFavorites: true, maxPinnedDrugOrders: 50 });
  jest.mocked(useLayoutType).mockReturnValue('small-desktop');
});

describe('DrugActionsMenu', () => {
  it('opens modal when pinning a new favorite', async () => {
    const user = userEvent.setup();
    mockUseFavoritesActions.mockReturnValue(defaultActions);
    mockShowModal.mockReturnValue(jest.fn());

    render(<DrugActionsMenu drug={mockDrug} />);
    const trigger = screen.getByRole('button', { name: /options/i });
    await user.click(trigger);
    await user.click(screen.getByText('Pin order'));

    expect(mockShowModal).toHaveBeenCalledWith('drug-favorites-modal', expect.objectContaining({ drug: mockDrug }));
  });
});
