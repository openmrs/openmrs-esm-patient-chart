import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Visit, useConfig, useLayoutType } from '@openmrs/esm-framework';
import DrugFavoritesListExtension from './drug-favorites-list.component';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

vi.mock('./useFavoritesActions', () => ({
  useFavoritesActions: vi.fn(),
}));

const mockUseFavoritesActions = vi.mocked(useFavoritesActions);
const mockUseConfig = vi.mocked(useConfig);
const favorite: DrugFavoriteOrder = {
  id: 'favorite-1',
  drugUuid: 'drug-1',
  displayName: 'Aspirin 81mg',
  attributes: { strength: '81mg' },
};
const defaultProps = {
  openOrderForm: vi.fn(),
  visit: {} as Visit,
};

describe('DrugFavoritesListExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfig.mockReturnValue({ enableDrugOrderFavorites: true });
    vi.mocked(useLayoutType).mockReturnValue('small-desktop');
    mockUseFavoritesActions.mockReturnValue({
      favorites: [favorite],
      error: undefined,
      isLoading: false,
      deleteMultipleFavorites: vi.fn(),
      persistFavorites: vi.fn(),
    });
  });

  it('marks and disables a favorite supplied as already prescribed', async () => {
    const user = userEvent.setup();
    render(<DrugFavoritesListExtension {...defaultProps} prescribedDrugUuids={new Set([favorite.drugUuid])} />);

    const favoriteButton = screen.getByRole('button', { name: /aspirin 81mg/i });
    expect(favoriteButton).toBeDisabled();
    expect(screen.getByText(/already prescribed/i)).toBeInTheDocument();

    await user.click(favoriteButton);
    expect(defaultProps.openOrderForm).not.toHaveBeenCalled();
  });

  it('opens the order form for an eligible favorite', async () => {
    const user = userEvent.setup();
    render(<DrugFavoritesListExtension {...defaultProps} />);

    const favoriteButton = screen.getByRole('button', { name: /aspirin 81mg/i });
    expect(favoriteButton).toBeEnabled();

    await user.click(favoriteButton);
    expect(defaultProps.openOrderForm).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'NEW',
        drug: expect.objectContaining({ uuid: favorite.drugUuid }),
      }),
    );
  });

  it('shows a section skeleton while order status is loading', () => {
    render(<DrugFavoritesListExtension {...defaultProps} isLoadingOrders />);

    expect(screen.queryByText(/my pinned drug orders/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aspirin 81mg/i })).not.toBeInTheDocument();
  });

  it('shows the favorites and keeps unpinning available when the shared order lookup fails', async () => {
    const user = userEvent.setup();
    const deleteMultipleFavorites = vi.fn();
    mockUseFavoritesActions.mockReturnValue({
      favorites: [favorite],
      error: undefined,
      isLoading: false,
      deleteMultipleFavorites,
      persistFavorites: vi.fn(),
    });
    render(<DrugFavoritesListExtension {...defaultProps} ordersError={new Error('Unable to load orders')} />);

    const favoriteButton = screen.getByRole('button', { name: /aspirin 81mg/i });
    expect(favoriteButton).toBeDisabled();
    expect(screen.queryByText(/already prescribed/i)).not.toBeInTheDocument();
    expect(screen.getByText(/error loading medication orders/i)).toBeInTheDocument();

    await user.click(favoriteButton);
    expect(defaultProps.openOrderForm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /unpin order/i }));
    expect(deleteMultipleFavorites).toHaveBeenCalledWith([favorite]);
  });

  it('does not show an order-status skeleton or error when there are no favorites', () => {
    mockUseFavoritesActions.mockReturnValue({
      favorites: [],
      error: undefined,
      isLoading: false,
      deleteMultipleFavorites: vi.fn(),
      persistFavorites: vi.fn(),
    });

    const { rerender } = render(<DrugFavoritesListExtension {...defaultProps} isLoadingOrders />);
    expect(screen.queryByText(/my pinned drug orders/i)).not.toBeInTheDocument();

    rerender(<DrugFavoritesListExtension {...defaultProps} ordersError={new Error('Unable to load orders')} />);
    expect(screen.queryByText(/error loading medication orders/i)).not.toBeInTheDocument();
  });

  it('shows a loading state while favorites are loading', () => {
    mockUseFavoritesActions.mockReturnValue({
      favorites: [],
      error: undefined,
      isLoading: true,
      deleteMultipleFavorites: vi.fn(),
      persistFavorites: vi.fn(),
    });

    render(<DrugFavoritesListExtension {...defaultProps} />);
    expect(screen.queryByText(/my pinned drug orders/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aspirin 81mg/i })).not.toBeInTheDocument();
  });

  it('shows an error notification when favorites cannot be loaded', () => {
    mockUseFavoritesActions.mockReturnValue({
      favorites: [],
      error: new Error('Unable to load favorites'),
      isLoading: false,
      deleteMultipleFavorites: vi.fn(),
      persistFavorites: vi.fn(),
    });

    render(<DrugFavoritesListExtension {...defaultProps} />);
    expect(screen.getByText(/error loading pinned orders/i)).toBeInTheDocument();
  });
});
