import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import DrugActionsMenu from './drug-actions-menu.component';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

jest.mock('./useFavoritesActions', () => ({
  useFavoritesActions: jest.fn(),
}));

const mockUseFavoritesActions = jest.mocked(useFavoritesActions);
const mockUseConfig = jest.mocked(useConfig);

const mockDrug: Drug = {
  uuid: 'drug-1',
  display: 'Aspirin 81mg',
  strength: '81mg',
  concept: { uuid: 'concept-1', display: 'Aspirin' },
} as Drug;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConfig.mockReturnValue({ enableDrugOrderFavorites: true, maxPinnedDrugOrders: 50 });
  jest.mocked(useLayoutType).mockReturnValue('small-desktop');
});

describe('DrugActionsMenu', () => {
  it('pins a drug directly when clicking the pin icon', async () => {
    const mockPersistFavorites = jest.fn().mockResolvedValue(true);
    mockUseFavoritesActions.mockReturnValue({
      favorites: [] as DrugFavoriteOrder[],
      isLoading: false,
      deleteMultipleFavorites: jest.fn(),
      persistFavorites: mockPersistFavorites,
      error: undefined,
    });

    const user = userEvent.setup();
    render(<DrugActionsMenu drug={mockDrug} />);
    const pinButton = screen.getByRole('button', { name: /pin order/i });
    await user.click(pinButton);

    expect(mockPersistFavorites).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ drugUuid: 'drug-1', displayName: 'Aspirin 81mg' })]),
      expect.objectContaining({ successTitle: 'Order pinned' }),
    );
  });
});
