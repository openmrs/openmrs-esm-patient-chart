import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, type Visit, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import DrugFavoritesListExtension from './drug-favorites-list.component';
import { useFavoritesActions } from './useFavoritesActions';
import { useDismissedSuggestions } from './useDismissedSuggestions';
import { useDrugOrderSuggestions } from './drug-suggestions.resource';
import type { DrugFavoriteOrder, DrugOrderSuggestion } from './types';

vi.mock('./useFavoritesActions', () => ({
  useFavoritesActions: vi.fn(),
}));

vi.mock('./useDismissedSuggestions', () => ({
  useDismissedSuggestions: vi.fn(),
}));

vi.mock('./drug-suggestions.resource', async (importOriginal) => ({
  ...(await importOriginal()),
  useDrugOrderSuggestions: vi.fn(),
}));

const mockUseFavoritesActions = vi.mocked(useFavoritesActions);
const mockUseDismissedSuggestions = vi.mocked(useDismissedSuggestions);
const mockUseDrugOrderSuggestions = vi.mocked(useDrugOrderSuggestions);
const mockUseConfig = vi.mocked(useConfig);
const defaultConfig = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
const suggestion: DrugOrderSuggestion = {
  drugUuid: 'drug-2',
  count: 18,
  lastOrderedAt: '2026-10-01T10:00:00+00:00',
  drug: {
    uuid: 'drug-2',
    display: 'Metformin 500mg',
    strength: '500mg',
    dosageForm: { uuid: 'tablet-uuid', display: 'Tablet' },
    concept: { uuid: 'metformin-concept-uuid', display: 'Metformin' },
  } as DrugOrderSuggestion['drug'],
};
const mockSuggestions = (overrides: Partial<ReturnType<typeof useDrugOrderSuggestions>> = {}) =>
  mockUseDrugOrderSuggestions.mockReturnValue({
    suggestions: [],
    orderCounts: new Map(),
    windowInDays: 90,
    scannedOrderCount: 0,
    totalOrderCount: 0,
    ...overrides,
  });
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
    mockUseConfig.mockReturnValue(defaultConfig);
    vi.mocked(useLayoutType).mockReturnValue('small-desktop');
    mockUseFavoritesActions.mockReturnValue({
      favorites: [favorite],
      error: undefined,
      isLoading: false,
      deleteMultipleFavorites: vi.fn(),
      persistFavorites: vi.fn(),
    });
    mockUseDismissedSuggestions.mockReturnValue({
      hiddenOrDismissedDrugUuids: new Set(),
      isSwapPromptHidden: false,
      hideSuggestion: vi.fn(),
      hideSwapPrompt: vi.fn(),
      dismissSuggestion: vi.fn(),
    });
    mockSuggestions();
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

  describe('suggestions', () => {
    it('shows suggestions with the reason they appear, even when nothing is pinned yet', () => {
      mockUseFavoritesActions.mockReturnValue({
        favorites: [],
        error: undefined,
        isLoading: false,
        deleteMultipleFavorites: vi.fn(),
        persistFavorites: vi.fn(),
      });
      mockSuggestions({ suggestions: [suggestion] });

      render(<DrugFavoritesListExtension {...defaultProps} />);

      expect(screen.getByRole('region', { name: /suggested for you/i })).toBeInTheDocument();
      expect(screen.getByText(/you haven't pinned anything yet/i)).toBeInTheDocument();
      expect(screen.getByText(/metformin 500mg/i)).toBeInTheDocument();
      expect(screen.getByText(/18 orders · last 90 days/i)).toBeInTheDocument();
      expect(screen.queryByText(/my pinned drug orders/i)).not.toBeInTheDocument();
    });

    it('collapses and expands the suggestions', async () => {
      const user = userEvent.setup();
      mockSuggestions({ suggestions: [suggestion] });

      render(<DrugFavoritesListExtension {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /collapse suggestions/i }));
      expect(screen.queryByText(/metformin 500mg/i)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /expand suggestions/i }));
      expect(screen.getByText(/metformin 500mg/i)).toBeInTheDocument();
    });

    it('pins a suggested drug', async () => {
      const user = userEvent.setup();
      const persistFavorites = vi.fn();
      mockUseFavoritesActions.mockReturnValue({
        favorites: [favorite],
        error: undefined,
        isLoading: false,
        deleteMultipleFavorites: vi.fn(),
        persistFavorites,
      });
      mockSuggestions({ suggestions: [suggestion] });

      render(<DrugFavoritesListExtension {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /^pin$/i }));

      expect(persistFavorites).toHaveBeenCalledWith(
        [favorite, expect.objectContaining({ drugUuid: suggestion.drugUuid, displayName: 'Metformin 500mg' })],
        expect.anything(),
      );
    });

    it('hides a suggestion for now or dismisses it permanently', async () => {
      const user = userEvent.setup();
      const hideSuggestion = vi.fn();
      const dismissSuggestion = vi.fn();
      mockUseDismissedSuggestions.mockReturnValue({
        hiddenOrDismissedDrugUuids: new Set(),
        isSwapPromptHidden: false,
        hideSuggestion,
        hideSwapPrompt: vi.fn(),
        dismissSuggestion,
      });
      mockSuggestions({ suggestions: [suggestion] });

      render(<DrugFavoritesListExtension {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /hide suggestion/i }));
      await user.click(screen.getByRole('button', { name: /don't suggest this again/i }));

      expect(hideSuggestion).toHaveBeenCalledWith(suggestion.drugUuid);
      expect(dismissSuggestion).toHaveBeenCalledWith(suggestion.drugUuid);
    });

    it('never suggests pinned or dismissed drugs', () => {
      mockUseDismissedSuggestions.mockReturnValue({
        hiddenOrDismissedDrugUuids: new Set(['dismissed-drug']),
        isSwapPromptHidden: false,
        hideSwapPrompt: vi.fn(),
        hideSuggestion: vi.fn(),
        dismissSuggestion: vi.fn(),
      });

      render(<DrugFavoritesListExtension {...defaultProps} />);

      expect(mockUseDrugOrderSuggestions).toHaveBeenLastCalledWith(
        new Set(['dismissed-drug', favorite.drugUuid]),
        true,
      );
    });

    describe('when pinned orders are full', () => {
      beforeEach(() => {
        mockUseConfig.mockReturnValue({ ...defaultConfig, maxPinnedDrugOrders: 1 });
      });

      it('marks the pinned list as full', () => {
        render(<DrugFavoritesListExtension {...defaultProps} />);

        expect(screen.getByText('1 / 1 full')).toBeInTheDocument();
      });

      it('offers to swap the least-ordered pin for a far more ordered drug', async () => {
        const user = userEvent.setup();
        const persistFavorites = vi.fn();
        mockUseFavoritesActions.mockReturnValue({
          favorites: [favorite],
          error: undefined,
          isLoading: false,
          deleteMultipleFavorites: vi.fn(),
          persistFavorites,
        });
        mockSuggestions({ suggestions: [suggestion], orderCounts: new Map([[favorite.drugUuid, 2]]) });

        render(<DrugFavoritesListExtension {...defaultProps} />);
        expect(screen.queryByRole('button', { name: /^pin$/i })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /swap them/i }));

        expect(persistFavorites).toHaveBeenCalledWith(
          [expect.objectContaining({ drugUuid: suggestion.drugUuid })],
          expect.anything(),
        );
      });

      it('disables swapping while a swap is being saved', async () => {
        const user = userEvent.setup();
        mockUseFavoritesActions.mockReturnValue({
          favorites: [favorite],
          error: undefined,
          isLoading: false,
          deleteMultipleFavorites: vi.fn(),
          persistFavorites: vi.fn(() => new Promise<boolean>(() => {})),
        });
        mockSuggestions({ suggestions: [suggestion] });

        render(<DrugFavoritesListExtension {...defaultProps} />);
        await user.click(screen.getByRole('button', { name: /swap them/i }));

        expect(screen.getByRole('button', { name: /swap them/i })).toBeDisabled();
      });

      it('keeps the current pins when the swap is declined', async () => {
        const user = userEvent.setup();
        const hideSwapPrompt = vi.fn();
        mockUseDismissedSuggestions.mockReturnValue({
          hiddenOrDismissedDrugUuids: new Set(),
          isSwapPromptHidden: false,
          hideSuggestion: vi.fn(),
          hideSwapPrompt,
          dismissSuggestion: vi.fn(),
        });
        mockSuggestions({ suggestions: [suggestion] });

        render(<DrugFavoritesListExtension {...defaultProps} />);
        await user.click(screen.getByRole('button', { name: /keep current/i }));

        expect(hideSwapPrompt).toHaveBeenCalled();
      });

      it('does not offer a swap once declined, or when the pins are ordered about as often', () => {
        mockSuggestions({ suggestions: [suggestion], orderCounts: new Map([[favorite.drugUuid, 10]]) });
        const { rerender } = render(<DrugFavoritesListExtension {...defaultProps} />);
        expect(screen.queryByRole('region', { name: /suggested for you/i })).not.toBeInTheDocument();

        mockSuggestions({ suggestions: [suggestion] });
        mockUseDismissedSuggestions.mockReturnValue({
          hiddenOrDismissedDrugUuids: new Set(),
          isSwapPromptHidden: true,
          hideSuggestion: vi.fn(),
          hideSwapPrompt: vi.fn(),
          dismissSuggestion: vi.fn(),
        });
        rerender(<DrugFavoritesListExtension {...defaultProps} />);
        expect(screen.queryByRole('region', { name: /suggested for you/i })).not.toBeInTheDocument();
      });
    });

    it('does not suggest drugs when suggestions are disabled', () => {
      mockUseConfig.mockReturnValue({ ...defaultConfig, enableDrugOrderSuggestions: false });

      render(<DrugFavoritesListExtension {...defaultProps} />);

      expect(mockUseDrugOrderSuggestions).toHaveBeenLastCalledWith(expect.any(Set), false);
    });

    it('hides suggestions while searching', () => {
      mockSuggestions({ suggestions: [suggestion] });

      render(<DrugFavoritesListExtension {...defaultProps} isSearching />);

      expect(screen.queryByRole('region', { name: /suggested for you/i })).not.toBeInTheDocument();
    });

    it('renders nothing while searching when there are suggestions but no pins', () => {
      mockUseFavoritesActions.mockReturnValue({
        favorites: [],
        error: undefined,
        isLoading: false,
        deleteMultipleFavorites: vi.fn(),
        persistFavorites: vi.fn(),
      });
      mockSuggestions({ suggestions: [suggestion] });

      const { container } = render(<DrugFavoritesListExtension {...defaultProps} isSearching />);

      expect(container).toBeEmptyDOMElement();
    });

    it.each([
      { scannedOrderCount: 200, totalOrderCount: 450, footnote: /approximate — based on your 200 most recent orders/i },
      { scannedOrderCount: 40, totalOrderCount: 40, footnote: /based on your orders in the last 90 days/i },
    ])(
      'notes what the suggestions are based on ($scannedOrderCount of $totalOrderCount orders scanned)',
      ({ scannedOrderCount, totalOrderCount, footnote }) => {
        mockSuggestions({ suggestions: [suggestion], scannedOrderCount, totalOrderCount });

        render(<DrugFavoritesListExtension {...defaultProps} />);

        expect(screen.getByText(footnote)).toBeInTheDocument();
      },
    );
  });
});
