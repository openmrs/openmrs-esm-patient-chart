import { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, openmrsFetch, reportError, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { addDrugFavorite, removeDrugFavorite } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { useFormAttributes } from './useFormAttributes';
import {
  buildFavoriteAttributes,
  buildFavoriteOrder,
  isConvertingFavoriteType,
  validateDrugAvailable,
  validateConceptAvailable,
} from './helpers';
import type { DrugFavoritesModalProps } from './types';
import type { ConfigObject } from '../config-schema';

export function useFavoriteForm({
  drug,
  initialAttributes: initialAttrs,
  existingFavorite,
  closeModal,
}: DrugFavoritesModalProps) {
  const { t } = useTranslation();
  const { maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, persistFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const drugUuid = drug?.uuid || existingFavorite?.drugUuid;
  const conceptUuid = drug?.concept?.uuid || existingFavorite?.conceptUuid;
  const conceptName = drug?.concept?.display || existingFavorite?.conceptName;
  const prefilled = initialAttrs || existingFavorite?.attributes;

  // Determine edit mode and favorite type
  const isEditing = Boolean(existingFavorite);
  const existing = existingFavorite;

  // Fetch drug if we only have drugUuid (from edit flow)
  const {
    data: fetchedDrugData,
    isLoading: isLoadingDrug,
    error: drugFetchError,
  } = useSWRImmutable<{ data: Drug }>(
    drugUuid && !drug
      ? `${restBaseUrl}/drug/${drugUuid}?v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (drugFetchError) {
      reportError(drugFetchError);
    }
  }, [drugFetchError]);

  const effectiveDrug = fetchedDrugData?.data || drug;

  const attributes = useFormAttributes({
    conceptName,
    conceptUuid,
    isConceptBased: existingFavorite
      ? Boolean(existingFavorite.conceptUuid && !existingFavorite.drugUuid)
      : Boolean(conceptUuid && !drugUuid),
    initialAttributes: existing?.attributes,
    effectiveDrug,
    strength: prefilled?.strength,
    dose: prefilled?.dose,
    unit: prefilled?.unit,
    route: prefilled?.route,
    frequency: prefilled?.frequency,
  });

  const isConceptBasedFavorite = useMemo(() => {
    return !attributes.selection.selected.strength;
  }, [attributes.selection.selected.strength]);

  const computedName = useMemo(() => {
    if (attributes.strength.selectedDrug) return attributes.strength.selectedDrug.display || '';

    const isSpecific = attributes.selection.selected.strength;
    if (isSpecific) return effectiveDrug?.display || '';

    return effectiveDrug?.concept?.display || conceptName || '';
  }, [attributes.selection.selected.strength, attributes.strength.selectedDrug, effectiveDrug, conceptName]);

  const handleSave = useCallback(async () => {
    const isSpecificFavorite = Boolean(attributes.strength.selectedDrug || attributes.selection.selected.strength);
    const drugForSave = attributes.strength.selectedDrug || effectiveDrug;

    // Validation
    if (!validateDrugAvailable(isSpecificFavorite, drugForSave)) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingOrder', 'Error saving order'),
        subtitle: t('drugNotSelected', 'Please select a drug before saving'),
      });
      return;
    }

    if (!validateConceptAvailable(isSpecificFavorite, effectiveDrug)) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingOrder', 'Error saving order'),
        subtitle: t('conceptNotAvailable', 'Drug information is not available'),
      });
      return;
    }

    if (!isEditing && favorites.length >= maxPinnedDrugOrders) {
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

    const newFavorite = buildFavoriteOrder(isSpecificFavorite, drugForSave, computedName, favoriteAttributes);

    // Handle type conversion if editing and switching between concept-based and drug-specific
    let baseFavorites = favorites;
    if (existingFavorite && isConvertingFavoriteType(existingFavorite, isSpecificFavorite)) {
      baseFavorites = removeDrugFavorite(favorites, existingFavorite.drugUuid, existingFavorite.conceptUuid);
    }

    const updatedFavorites = addDrugFavorite(baseFavorites, newFavorite);

    const success = await persistFavorites(updatedFavorites, {
      successTitle: isEditing ? t('orderUpdated', 'Order updated') : t('orderPinned', 'Order pinned'),
      successSubtitle: isEditing
        ? t('orderUpdatedSubtitle', '{{drugName}} has been updated in your pinned orders', {
            drugName: newFavorite.displayName,
          })
        : t('orderPinnedSubtitle', '{{drugName}} has been added to your pinned orders', {
            drugName: newFavorite.displayName,
          }),
      errorTitle: t('errorPinningOrder', 'Error pinning order'),
    });

    setIsSaving(false);

    if (success) {
      closeModal();
    }
  }, [
    effectiveDrug,
    attributes,
    favorites,
    maxPinnedDrugOrders,
    isEditing,
    existingFavorite,
    computedName,
    persistFavorites,
    closeModal,
    t,
  ]);

  return {
    isLoadingDrug,
    isSaving,
    isEditing,
    isConceptBasedFavorite,
    computedName,
    handleSave,
    attributes,
  };
}
