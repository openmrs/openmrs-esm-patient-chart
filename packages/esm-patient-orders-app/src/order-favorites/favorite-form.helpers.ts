import type { Drug } from '@openmrs/esm-patient-common-lib';
import type { AttributeKey, DrugFavoriteAttributes, DrugFavoriteOrder } from './types';

/**
 * Builds the DrugFavoriteAttributes object from selected attributes and resolved values.
 * Only includes attributes that are selected (toggled on).
 *
 * Note: dosageForm is always stored for concept-based favorites to enable
 * instant reconstruction without additional API calls.
 */
export function buildFavoriteAttributes(
  selectedAttributes: Record<AttributeKey, boolean>,
  resolvedValues: Record<AttributeKey, string | undefined>,
  resolvedUuids: { unitUuid?: string; routeUuid?: string; frequencyUuid?: string },
  drugForSave?: Drug,
): DrugFavoriteAttributes {
  const attributes: DrugFavoriteAttributes = {};

  if (selectedAttributes.strength && resolvedValues.strength) {
    attributes.strength = resolvedValues.strength;
  }

  if (selectedAttributes.dose && resolvedValues.dose) {
    attributes.dose = resolvedValues.dose;
  }

  if (selectedAttributes.unit && resolvedValues.unit) {
    attributes.unit = resolvedValues.unit;
    if (resolvedUuids.unitUuid) {
      attributes.unitUuid = resolvedUuids.unitUuid;
    }
  }

  if (selectedAttributes.route && resolvedValues.route) {
    attributes.route = resolvedValues.route;
    if (resolvedUuids.routeUuid) {
      attributes.routeUuid = resolvedUuids.routeUuid;
    }
  }

  if (selectedAttributes.frequency && resolvedValues.frequency) {
    attributes.frequency = resolvedValues.frequency;
    if (resolvedUuids.frequencyUuid) {
      attributes.frequencyUuid = resolvedUuids.frequencyUuid;
    }
  }

  if (drugForSave?.dosageForm) {
    attributes.dosageFormDisplay = drugForSave.dosageForm.display;
    if (drugForSave.dosageForm.uuid) {
      attributes.dosageFormUuid = drugForSave.dosageForm.uuid;
    }
  }

  return attributes;
}

/**
 * Builds a DrugFavoriteOrder object from form state.
 * Creates either a drug-specific favorite or a concept-based (any strength) favorite.
 */
export function buildFavoriteOrder(
  isSpecificFavorite: boolean,
  drugForSave: Drug,
  computedName: string,
  attributes: DrugFavoriteAttributes,
): DrugFavoriteOrder {
  if (isSpecificFavorite) {
    return {
      drugUuid: drugForSave.uuid,
      conceptUuid: drugForSave.concept?.uuid,
      conceptName: drugForSave.concept?.display,
      displayName: computedName,
      attributes,
    };
  } else {
    if (!drugForSave.concept?.uuid) {
      throw new Error('Cannot create concept-based favorite: drug has no concept.');
    }
    return {
      conceptUuid: drugForSave.concept.uuid,
      conceptName: drugForSave.concept.display,
      displayName: computedName,
      attributes,
    };
  }
}

export function isConvertingFavoriteType(
  existingFavorite: DrugFavoriteOrder | undefined,
  isSpecificFavorite: boolean,
): boolean {
  if (!existingFavorite) return false;

  const wasConceptBased = Boolean(existingFavorite.conceptUuid && !existingFavorite.drugUuid);
  const wasDrugBased = Boolean(existingFavorite.drugUuid);

  return (wasConceptBased && isSpecificFavorite) || (wasDrugBased && !isSpecificFavorite);
}

export function validateDrugAvailable(isSpecificFavorite: boolean, drug?: Drug): boolean {
  return !isSpecificFavorite || Boolean(drug?.uuid);
}

export function validateConceptAvailable(isSpecificFavorite: boolean, drug?: Drug): boolean {
  return isSpecificFavorite || Boolean(drug?.concept?.uuid);
}
