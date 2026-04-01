import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { addDrugFavorite } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { useFormAttributes } from './useFormAttributes';
import {
  buildFavoriteAttributes,
  buildFavoriteOrder,
  validateDrugAvailable,
  validateConceptAvailable,
} from './helpers';
import type { DrugFavoritesModalProps } from './types';
import type { ConfigObject } from '../config-schema';

export function useFavoriteForm({ drug, initialAttributes, closeModal }: DrugFavoritesModalProps) {
  const { t } = useTranslation();
  const { maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, persistFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const drugUuid = drug?.uuid;
  const conceptUuid = drug?.concept?.uuid;
  const conceptName = drug?.concept?.display;

  const attributes = useFormAttributes({
    conceptName,
    conceptUuid,
    isConceptBased: Boolean(conceptUuid && !drugUuid),
    effectiveDrug: drug,
    strength: initialAttributes?.strength,
    dose: initialAttributes?.dose,
    unit: initialAttributes?.unit,
    route: initialAttributes?.route,
    frequency: initialAttributes?.frequency,
  });

  const isConceptBasedFavorite = useMemo(() => {
    return !attributes.selection.selected.strength;
  }, [attributes.selection.selected.strength]);

  const computedName = useMemo(() => {
    if (attributes.strength.selectedDrug) return attributes.strength.selectedDrug.display || '';

    const isSpecific = attributes.selection.selected.strength;
    if (isSpecific) return drug?.display || '';

    return drug?.concept?.display || conceptName || '';
  }, [attributes.selection.selected.strength, attributes.strength.selectedDrug, drug, conceptName]);

  const handleSave = useCallback(async () => {
    const isSpecificFavorite = Boolean(attributes.strength.selectedDrug || attributes.selection.selected.strength);
    const drugForSave = attributes.strength.selectedDrug || drug;

    // Validation
    if (!validateDrugAvailable(isSpecificFavorite, drugForSave)) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingOrder', 'Error saving order'),
        subtitle: t('drugNotSelected', 'Please select a drug before saving'),
      });
      return;
    }

    if (!validateConceptAvailable(isSpecificFavorite, conceptUuid)) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingOrder', 'Error saving order'),
        subtitle: t('conceptNotAvailable', 'Drug information is not available'),
      });
      return;
    }

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

    const favoriteAttributes = buildFavoriteAttributes(
      attributes.selection.selected,
      attributes.resolved.values,
      attributes.resolved.uuids,
      drugForSave,
      isSpecificFavorite,
    );

    const newFavorite = buildFavoriteOrder(
      isSpecificFavorite,
      drugForSave,
      computedName,
      favoriteAttributes,
      conceptUuid,
      conceptName,
    );

    const updatedFavorites = addDrugFavorite(favorites, newFavorite);

    const success = await persistFavorites(updatedFavorites, {
      successTitle: t('orderPinned', 'Order pinned'),
      successSubtitle: t('orderPinnedSubtitle', '{{drugName}} has been added to your pinned orders', {
        drugName: newFavorite.displayName,
      }),
      errorTitle: t('errorPinningOrder', 'Error pinning order'),
    });

    setIsSaving(false);

    if (success) {
      closeModal();
    }
  }, [
    drug,
    conceptUuid,
    conceptName,
    attributes,
    favorites,
    maxPinnedDrugOrders,
    computedName,
    persistFavorites,
    closeModal,
    t,
  ]);

  return {
    isSaving,
    isConceptBasedFavorite,
    computedName,
    handleSave,
    attributes,
  };
}
