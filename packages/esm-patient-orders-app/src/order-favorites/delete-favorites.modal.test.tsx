import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteFavoritesModal from './delete-favorites.modal';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

jest.mock('./useFavoritesActions', () => ({
  useFavoritesActions: jest.fn(),
}));

const mockUseFavoritesActions = jest.mocked(useFavoritesActions);

const makeFavorite = (id: string, name: string): DrugFavoriteOrder =>
  ({ id, drugUuid: `drug-${id}`, displayName: name, attributes: {} }) as DrugFavoriteOrder;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DeleteFavoritesModal', () => {
  it('calls deleteMultipleFavorites and closes modal on single delete', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn().mockResolvedValue(true);
    const mockClose = jest.fn();
    mockUseFavoritesActions.mockReturnValue({
      favorites: [],
      isLoading: false,
      deleteMultipleFavorites: mockDelete,
      persistFavorites: jest.fn(),
      error: undefined,
    });

    const favorites = [makeFavorite('1', 'Aspirin 81mg')];
    render(<DeleteFavoritesModal closeModal={mockClose} favorites={favorites} />);

    expect(screen.getByText(/Aspirin 81mg/)).toBeInTheDocument();
    await user.click(screen.getByText('Delete'));

    expect(mockDelete).toHaveBeenCalledWith(favorites);
    expect(mockClose).toHaveBeenCalled();
  });

  it('shows bulk delete confirmation with count', () => {
    mockUseFavoritesActions.mockReturnValue({
      favorites: [],
      isLoading: false,
      deleteMultipleFavorites: jest.fn().mockResolvedValue(true),
      persistFavorites: jest.fn(),
      error: undefined,
    });

    const favorites = [makeFavorite('1', 'Aspirin'), makeFavorite('2', 'Ibuprofen'), makeFavorite('3', 'Tylenol')];
    render(<DeleteFavoritesModal closeModal={jest.fn()} favorites={favorites} />);

    expect(screen.getByText('Delete pinned orders')).toBeInTheDocument();
    expect(screen.getByText(/3 orders/)).toBeInTheDocument();
  });
});
