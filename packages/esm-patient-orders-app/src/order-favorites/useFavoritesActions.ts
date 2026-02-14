import { useCallback, useRef } from 'react';
import { showSnackbar, useSession, reportError } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useDrugFavorites, removeDrugFavorite, saveDrugFavorites } from './drug-favorites.resource';
import { FAVORITES_PROPERTY_KEYS } from './constants';
import type { DrugFavoriteOrder, UserResponse } from './types';

type UserData = { data: UserResponse };

function createOptimisticData(updatedFavorites: DrugFavoriteOrder[]) {
  return (currentData: UserData | undefined): UserData | undefined =>
    currentData
      ? {
          data: {
            ...currentData.data,
            userProperties: {
              ...currentData.data.userProperties,
              [FAVORITES_PROPERTY_KEYS.DRUG]: JSON.stringify({ favorites: updatedFavorites }),
            },
          },
        }
      : currentData;
}

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
      if (!user?.uuid) return false;

      mutate(createOptimisticData(updatedFavorites), false);

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
    [user?.uuid, mutate],
  );

  const deleteMultipleFavorites = useCallback(
    async (favoritesToDelete: DrugFavoriteOrder[]) => {
      if (favoritesToDelete.length === 0) return false;

      const isSingleDelete = favoritesToDelete.length === 1;
      const itemName = isSingleDelete ? favoritesToDelete[0]?.displayName : '';

      let updatedFavorites = [...favoritesRef.current];
      favoritesToDelete.forEach((favorite) => {
        updatedFavorites = removeDrugFavorite(updatedFavorites, favorite.drugUuid, favorite.conceptUuid);
      });

      return persistFavorites(updatedFavorites, {
        successTitle: isSingleDelete
          ? t('orderDeleted', 'Pinned order deleted')
          : t('ordersDeleted', 'Pinned orders deleted'),
        successSubtitle: isSingleDelete
          ? t('orderDeletedSubtitle', '{{name}} has been removed from your pinned orders', { name: itemName })
          : t('ordersDeletedSubtitle', '{{total}} orders have been removed from your pinned orders', {
              total: favoritesToDelete.length,
            }),
        errorTitle: isSingleDelete
          ? t('errorDeletingOrder', 'Error deleting pinned order')
          : t('errorDeletingOrders', 'Error deleting pinned orders'),
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
