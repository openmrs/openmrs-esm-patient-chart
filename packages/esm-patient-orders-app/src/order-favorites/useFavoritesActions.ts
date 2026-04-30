import { useCallback, useRef } from 'react';
import { showSnackbar, useSession, reportError } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import {
  FAVORITES_PROPERTY_KEY,
  useDrugFavorites,
  removeDrugFavorite,
  saveDrugFavorites,
} from './drug-favorites.resource';
import type { DrugFavoriteOrder } from './types';

interface SnackbarMessages {
  successTitle: string;
  successSubtitle: string;
  errorTitle: string;
}

export function useFavoritesActions() {
  const { t } = useTranslation();
  const { user } = useSession();
  const { favorites, error, isLoading, mutate } = useDrugFavorites(user?.uuid);
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const persistFavorites = useCallback(
    async (updatedFavorites: DrugFavoriteOrder[], messages: SnackbarMessages): Promise<boolean> => {
      if (!user?.uuid || isLoading) return false;

      mutate(
        (currentData) =>
          currentData
            ? {
                data: {
                  ...currentData.data,
                  userProperties: {
                    ...currentData.data.userProperties,
                    [FAVORITES_PROPERTY_KEY]: JSON.stringify({ favorites: updatedFavorites }),
                  },
                },
              }
            : currentData,
        false,
      );

      try {
        await saveDrugFavorites(user.uuid, updatedFavorites);
        mutate();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: messages.successTitle,
          subtitle: messages.successSubtitle,
        });
        return true;
      } catch (error: unknown) {
        mutate();
        reportError(error);
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: messages.errorTitle,
          subtitle: error instanceof Error ? error.message : '',
        });
        return false;
      }
    },
    [user?.uuid, isLoading, mutate],
  );

  const deleteMultipleFavorites = useCallback(
    async (favoritesToDelete: DrugFavoriteOrder[]) => {
      if (favoritesToDelete.length === 0) return false;

      const isSingleDelete = favoritesToDelete.length === 1;
      const itemName = isSingleDelete ? favoritesToDelete[0]?.displayName : '';

      let updatedFavorites = [...favoritesRef.current];
      favoritesToDelete.forEach((favorite) => {
        updatedFavorites = removeDrugFavorite(updatedFavorites, favorite.id);
      });

      return persistFavorites(updatedFavorites, {
        successTitle: isSingleDelete ? t('orderUnpinned', 'Order unpinned') : t('ordersUnpinned', 'Orders unpinned'),
        successSubtitle: isSingleDelete
          ? t('orderUnpinnedSubtitle', '{{drugName}} removed from your pinned orders', {
              drugName: itemName,
              interpolation: { escapeValue: false },
            })
          : t('ordersUnpinnedSubtitle', '{{count}} orders removed from your pinned orders', {
              count: favoritesToDelete.length,
            }),
        errorTitle: isSingleDelete
          ? t('errorUnpinningOrder', 'Error unpinning order')
          : t('errorUnpinningOrders', 'Error unpinning orders'),
      });
    },
    [persistFavorites, t],
  );

  return {
    favorites,
    error,
    isLoading,
    deleteMultipleFavorites,
    persistFavorites,
  };
}
