import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { addDrugFavorite, removeDrugFavorite, getDrugFavorite } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { useFormAttributes } from './useFormAttributes';
import {
  buildFavoriteAttributes,
  buildFavoriteOrder,
  isConvertingFavoriteType,
  validateDrugAvailable,
  validateConceptAvailable,
} from './favorite-form.helpers';
import type { DrugFavoritesModalProps } from './types';
import type { ConfigObject } from '../config-schema';

export function useFavoriteForm({
  drug,
  drugUuid,
  conceptUuid,
  conceptName,
  strength,
  dose,
  unit,
  unitUuid,
  route,
  routeUuid,
  frequency,
  frequencyUuid,
  existingFavorite,
  closeModal,
}: DrugFavoritesModalProps) {
  const { t } = useTranslation();
  const { maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, persistFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  // Determine edit mode and favorite type
  const isEditingFromList = Boolean(existingFavorite);
  const existing =
    existingFavorite || getDrugFavorite(favorites, drug?.uuid || drugUuid, drug?.concept?.uuid || conceptUuid);
  const isEditing = Boolean(existing);
  const isConceptBasedFavorite = existingFavorite
    ? Boolean(existingFavorite.conceptUuid && !existingFavorite.drugUuid)
    : Boolean(conceptUuid && !drugUuid);

  // Fetch drug if we only have drugUuid (from edit flow)
  const { data: fetchedDrugData, isLoading: isLoadingDrug } = useSWRImmutable<{ data: Drug }>(
    drugUuid && !drug
      ? `${restBaseUrl}/drug/${drugUuid}?v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const effectiveDrug = fetchedDrugData?.data || drug;

  const attributes = useFormAttributes({
    conceptName: existingFavorite?.conceptName || conceptName,
    conceptUuid: existingFavorite?.conceptUuid || conceptUuid,
    isConceptBased: isConceptBasedFavorite,
    initialAttributes: existing?.attributes,
    effectiveDrug,
    strength,
    dose,
    unit,
    route,
    frequency,
  });

  const computedName = useMemo(() => {
    if (attributes.selectedStrengthDrug) return attributes.selectedStrengthDrug.display || '';

    const isSpecific = attributes.selectedAttributes.strength;
    if (isSpecific) return effectiveDrug?.display || '';

    return effectiveDrug?.concept?.display || conceptName || '';
  }, [attributes.selectedAttributes.strength, attributes.selectedStrengthDrug, effectiveDrug, conceptName]);

  const handleSave = useCallback(async () => {
    const isSpecificFavorite = Boolean(attributes.selectedStrengthDrug || attributes.selectedAttributes.strength);
    const drugForSave = attributes.selectedStrengthDrug || effectiveDrug;

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
      attributes.selectedAttributes,
      attributes.resolvedValues,
      attributes.resolvedUuids,
      drugForSave,
    );

    const newFavorite = buildFavoriteOrder(isSpecificFavorite, drugForSave, computedName, favoriteAttributes);

    // Handle type conversion if editing and switching between concept-based and drug-specific
    let baseFavorites = favorites;
    if (isEditingFromList && existingFavorite && isConvertingFavoriteType(existingFavorite, isSpecificFavorite)) {
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
    isEditingFromList,
    existingFavorite,
    computedName,
    persistFavorites,
    closeModal,
    t,
  ]);

  return {
    // Loading
    isLoadingDrug,
    isLoadingStrengths: attributes.isLoadingStrengths,
    isLoadingOrderConfig: attributes.isLoadingOrderConfig,
    isSaving,

    // Derived
    isEditing,
    isConceptBasedFavorite,
    computedName,
    resolvedValues: attributes.resolvedValues,
    hasPrefilledDose: attributes.hasPrefilledDose,
    hasPrefilledRoute: attributes.hasPrefilledRoute,
    hasPrefilledFrequency: attributes.hasPrefilledFrequency,

    // Attribute selection
    selectedAttributes: attributes.selectedAttributes,
    showManualInputs: attributes.showManualInputs,

    // Strength
    availableStrengths: attributes.availableStrengths,
    strengthOptions: attributes.strengthOptions,
    selectedStrengthId: attributes.selectedStrengthId,

    // Order config data
    routes: attributes.routes,
    frequencies: attributes.frequencies,

    // Manual input values
    manualDose: attributes.manualDose,
    manualRoute: attributes.manualRoute,
    manualFrequency: attributes.manualFrequency,

    // Handlers
    handleRemoveAttribute: attributes.handleRemoveAttribute,
    handleAddAttribute: attributes.handleAddAttribute,
    handleShowManualInput: attributes.handleShowManualInput,
    handleHideManualInput: attributes.handleHideManualInput,
    handleStrengthChange: attributes.handleStrengthChange,
    handleSave,
    setManualDose: attributes.setManualDose,
    setManualRoute: attributes.setManualRoute,
    setManualFrequency: attributes.setManualFrequency,
  };
}
