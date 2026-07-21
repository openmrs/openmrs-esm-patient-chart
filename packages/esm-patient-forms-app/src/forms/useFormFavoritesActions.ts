import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { reportError, showSnackbar, useSession } from '@openmrs/esm-framework';
import {
  FORM_FAVORITES_PROPERTY_KEY,
  type FormFavorite,
  removeFormFavorite,
  saveFormFavorites,
  useFormFavorites,
} from './form-favorites.resource';

interface SnackbarMessages {
  successTitle: string;
  successSubtitle: string;
  errorTitle: string;
}

export function useFormFavoritesActions() {
  const { t } = useTranslation();
  const { user } = useSession();
  const { favorites, error, isLoading, mutate } = useFormFavorites(user?.uuid);
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const persistFavorites = useCallback(
    async (updatedFavorites: FormFavorite[], messages: SnackbarMessages): Promise<boolean> => {
      if (!user?.uuid || isLoading) return false;

      mutate(
        (currentData) =>
          currentData
            ? {
                data: {
                  ...currentData.data,
                  userProperties: {
                    ...currentData.data.userProperties,
                    [FORM_FAVORITES_PROPERTY_KEY]: JSON.stringify({ favorites: updatedFavorites }),
                  },
                },
              }
            : currentData,
        false,
      );

      try {
        await saveFormFavorites(user.uuid, updatedFavorites);
        mutate();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: messages.successTitle,
          subtitle: messages.successSubtitle,
        });
        return true;
      } catch (err: unknown) {
        mutate();
        reportError(err);
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: messages.errorTitle,
          subtitle: err instanceof Error ? err.message : '',
        });
        return false;
      }
    },
    [user?.uuid, isLoading, mutate],
  );

  const deleteMultipleFavorites = useCallback(
    async (favoritesToDelete: FormFavorite[]) => {
      if (favoritesToDelete.length === 0) return false;

      const isSingleDelete = favoritesToDelete.length === 1;
      const itemName = isSingleDelete ? favoritesToDelete[0]?.displayName : '';

      let updatedFavorites = [...favoritesRef.current];
      favoritesToDelete.forEach((favorite) => {
        updatedFavorites = removeFormFavorite(updatedFavorites, favorite.formUuid);
      });

      return persistFavorites(updatedFavorites, {
        successTitle: isSingleDelete ? t('formUnpinned', 'Form unpinned') : t('formsUnpinned', 'Forms unpinned'),
        successSubtitle: isSingleDelete
          ? t('formUnpinnedSubtitle', '{{formName}} removed from your pinned forms', {
              formName: itemName,
              interpolation: { escapeValue: false },
            })
          : t('formsUnpinnedSubtitle', '{{count}} forms removed from your pinned forms', {
              count: favoritesToDelete.length,
            }),
        errorTitle: isSingleDelete
          ? t('errorUnpinningForm', 'Error unpinning form')
          : t('errorUnpinningForms', 'Error unpinning forms'),
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
