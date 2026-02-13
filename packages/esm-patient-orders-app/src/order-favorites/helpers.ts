import type { Visit } from '@openmrs/esm-framework';
import type { Drug, DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import type { AttributeKey, DrugFavoriteAttributes, DrugFavoriteOrder } from './types';

export function formatDrugInfo(favorite: DrugFavoriteOrder, anyStrengthLabel: string): string {
  const parts: string[] = [];

  if (favorite.drugUuid && favorite.attributes.strength) {
    parts.push(favorite.attributes.strength);
  } else if (favorite.conceptUuid) {
    parts.push(anyStrengthLabel);
  }

  if (favorite.attributes.dose && favorite.attributes.unit) {
    parts.push(`${favorite.attributes.dose} ${favorite.attributes.unit}`);
  } else if (favorite.attributes.unit) {
    parts.push(favorite.attributes.unit);
  }

  if (favorite.attributes.route) parts.push(favorite.attributes.route);
  if (favorite.attributes.frequency) parts.push(favorite.attributes.frequency);

  return parts.join(' — ');
}

export function createDrugFromFavorite(favorite: DrugFavoriteOrder): Drug | null {
  if (!favorite.drugUuid) {
    return null;
  }
  const attrs = favorite.attributes;

  return {
    uuid: favorite.drugUuid,
    display: favorite.displayName,
    strength: attrs.strength,
    dosageForm:
      attrs.dosageFormDisplay && attrs.dosageFormUuid
        ? { display: attrs.dosageFormDisplay, uuid: attrs.dosageFormUuid }
        : undefined,
    concept: favorite.conceptUuid
      ? { uuid: favorite.conceptUuid, display: favorite.conceptName || favorite.displayName }
      : undefined,
  } as Drug;
}

export function buildBasketItem(
  drug: Drug,
  favorite: DrugFavoriteOrder,
  visit: Visit,
  daysDurationUnit?: { uuid: string; display: string },
): DrugOrderBasketItem {
  const attrs = favorite.attributes;
  const includeManualAttrs = Boolean(favorite.drugUuid);

  return {
    action: 'NEW',
    display: drug.display,
    drug,
    commonMedicationName: favorite.displayName,
    dosage: includeManualAttrs && attrs.dose ? parseFloat(attrs.dose) : null,
    unit: attrs.unit && attrs.unitUuid ? { value: attrs.unit, valueCoded: attrs.unitUuid } : null,
    route:
      includeManualAttrs && attrs.route && attrs.routeUuid ? { value: attrs.route, valueCoded: attrs.routeUuid } : null,
    frequency:
      includeManualAttrs && attrs.frequency && attrs.frequencyUuid
        ? { value: attrs.frequency, valueCoded: attrs.frequencyUuid }
        : null,
    quantityUnits: drug.dosageForm ? { value: drug.dosageForm.display, valueCoded: drug.dosageForm.uuid } : null,
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: null,
    startDate: new Date(),
    duration: null,
    durationUnit: daysDurationUnit ? { value: daysDurationUnit.display, valueCoded: daysDurationUnit.uuid } : null,
    pillsDispensed: null,
    numRefills: null,
    freeTextDosage: '',
    indication: '',
    visit,
  };
}

/**
 * Builds the DrugFavoriteAttributes object from selected attributes and resolved values.
 *
 * Manual attributes (dose, route, frequency) are ONLY included for drug-specific favorites.
 * Concept-based favorites can only have strength and unit attributes.
 *
 * Note: dosageForm is always stored to enable instant reconstruction without additional API calls.
 */
export function buildFavoriteAttributes(
  selectedAttributes: Record<AttributeKey, boolean>,
  resolvedValues: Record<AttributeKey, string | undefined>,
  resolvedUuids: { unitUuid?: string; routeUuid?: string; frequencyUuid?: string },
  drugForSave?: Drug,
  hasDrugUuid: boolean = true,
): DrugFavoriteAttributes {
  const attributes: DrugFavoriteAttributes = {};
  const includeManualAttrs = hasDrugUuid;

  if (selectedAttributes.strength && resolvedValues.strength) {
    attributes.strength = resolvedValues.strength;
  }

  if (includeManualAttrs && selectedAttributes.dose && resolvedValues.dose) {
    attributes.dose = resolvedValues.dose;
  }

  if (selectedAttributes.unit && resolvedValues.unit) {
    attributes.unit = resolvedValues.unit;
    if (resolvedUuids.unitUuid) {
      attributes.unitUuid = resolvedUuids.unitUuid;
    }
  }

  if (includeManualAttrs && selectedAttributes.route && resolvedValues.route) {
    attributes.route = resolvedValues.route;
    if (resolvedUuids.routeUuid) {
      attributes.routeUuid = resolvedUuids.routeUuid;
    }
  }

  if (includeManualAttrs && selectedAttributes.frequency && resolvedValues.frequency) {
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
