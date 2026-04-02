import { v4 as uuid } from 'uuid';
import type { Visit } from '@openmrs/esm-framework';
import type { Drug, DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import type { DrugFavoriteOrder } from './types';

export function createDrugFromFavorite(favorite: DrugFavoriteOrder): Drug {
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
  visit: Visit,
  daysDurationUnit?: { uuid: string; display: string },
): DrugOrderBasketItem {
  return {
    action: 'NEW',
    display: drug.display,
    drug,
    commonMedicationName: drug.display,
    dosage: null,
    unit: drug.dosageForm ? { value: drug.dosageForm.display, valueCoded: drug.dosageForm.uuid } : null,
    route: null,
    frequency: null,
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

export function buildFavoriteOrder(drug: Drug): DrugFavoriteOrder {
  return {
    id: uuid(),
    drugUuid: drug.uuid,
    conceptUuid: drug.concept?.uuid,
    conceptName: drug.concept?.display,
    displayName: drug.display,
    attributes: {
      strength: drug.strength,
      dosageFormDisplay: drug.dosageForm?.display,
      dosageFormUuid: drug.dosageForm?.uuid,
    },
  };
}
