import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import { addDrugFavorite, isDrugFavorite, getDrugFavorite } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { buildFavoriteOrder } from './helpers';

export function usePinToggle(drug: Drug | undefined) {
  const { t } = useTranslation();
  const { enableDrugOrderFavorites, maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, isLoading, deleteMultipleFavorites, persistFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const isPinned = isDrugFavorite(favorites, drug?.uuid);

  const toggle = useCallback(async () => {
    if (!drug?.uuid) {
      return;
    }

    if (isPinned) {
      const favorite = getDrugFavorite(favorites, drug.uuid);
      if (favorite) {
        setIsSaving(true);
        await deleteMultipleFavorites([favorite]);
        setIsSaving(false);
      }
    } else {
      if (favorites.length >= maxPinnedDrugOrders) {
        showSnackbar({
          isLowContrast: false,
          kind: 'warning',
          title: t('maxPinnedOrdersReached', 'Maximum pinned orders reached'),
          subtitle: t('maxPinnedOrdersSubtitle', 'You can have a maximum of {{max}} pinned drug orders', {
            max: maxPinnedDrugOrders,
          }),
        });
        return;
      }

      setIsSaving(true);
      const newFavorite = buildFavoriteOrder(drug);
      const updatedFavorites = addDrugFavorite(favorites, newFavorite);
      await persistFavorites(updatedFavorites, {
        successTitle: t('orderPinned', 'Order pinned'),
        successSubtitle: t('orderPinnedSubtitle', '{{drugName}} added to your pinned orders', {
          drugName: newFavorite.displayName,
          interpolation: { escapeValue: false },
        }),
        errorTitle: t('errorPinningOrder', 'Error pinning order'),
      });
      setIsSaving(false);
    }
  }, [drug, isPinned, favorites, deleteMultipleFavorites, persistFavorites, maxPinnedDrugOrders, t]);

  return { isPinned, isSaving, isLoading, isEnabled: Boolean(drug && enableDrugOrderFavorites), toggle };
}
