import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { type DrugOrderBasketItem, type DrugOrderTemplate, type OrderTemplate } from '../../types';

export interface DrugSearchResult {
  uuid: string;
  display: string;
  name: string;
  strength: string;
  dosageForm: {
    display: string;
    uuid: string;
  };
  concept: {
    display: string;
    uuid: string;
  };
}

export function useDrugSearch(query: string): {
  isLoading: boolean;
  drugs: Array<DrugSearchResult>;
  error: Error;
} {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<{ results: Array<DrugSearchResult> }>, Error>(
    query
      ? `/ws/rest/v1/drug?q=${query}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      isLoading,
      drugs: data?.data?.results || [],
      error,
    }),
    [data, error, isLoading],
  );

  return results;
}

export function useDrugTemplate(drugUuid: string): {
  isLoading: boolean;
  templates: Array<DrugOrderTemplate>;
  error: Error;
} {
  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<{
      results: Array<{
        uuid: string;
        drug: Drug;
        name: string;
        template: string;
      }>;
    }>,
    Error
  >(drugUuid ? `/ws/rest/v1/ordertemplates/orderTemplate?drug=${drugUuid}` : null, openmrsFetch);

  const results = useMemo(
    () => ({
      isLoading,
      templates: (data?.data?.results || []).map((template) => ({
        ...template,
        template: JSON.parse(template.template) as OrderTemplate,
      })),
      error,
    }),
    [data, error, isLoading],
  );

  return results;
}

export function getDefault(template: OrderTemplate, prop: string) {
  return template?.dosingInstructions?.[prop]?.find((x) => x.default) || template?.dosingInstructions?.[prop]?.[0];
}

export function getTemplateOrderBasketItem(
  drug: DrugSearchResult,
  configDefaultDurationConcept?: {
    uuid: string;
    display: string;
  },
  template?: DrugOrderTemplate,
): DrugOrderBasketItem {
  const dosageForm = drug.dosageForm;
  const defaultQuantityUnits = dosageForm ? { value: dosageForm.display, valueCoded: dosageForm.uuid } : null;
  const defaultUnit = dosageForm ? { value: dosageForm.display, valueCoded: dosageForm.uuid } : null;

  const defaultDurationUnit = configDefaultDurationConcept
    ? { value: configDefaultDurationConcept.display, valueCoded: configDefaultDurationConcept.uuid }
    : null;

  if (template) {
    const unit = getDefault(template.template, 'unit') ?? defaultUnit;
    const dosage = getDefault(template.template, 'dose')?.value;
    const frequency = getDefault(template.template, 'frequency');
    const route = getDefault(template.template, 'route');
    const asNeeded = template.template?.dosingInstructions?.asNeeded ?? false;
    const asNeededCondition = template.template?.dosingInstructions?.asNeededCondition;
    const quantityUnits = getDefault(template.template, 'quantityUnits') ?? defaultQuantityUnits;

    return {
      action: 'NEW',
      display: drug.display,
      drug,
      unit,
      dosage,
      frequency,
      route,
      commonMedicationName: drug.display,
      isFreeTextDosage: false,
      patientInstructions: '',
      asNeeded,
      asNeededCondition,
      startDate: new Date(),
      duration: null,
      durationUnit: defaultDurationUnit,
      pillsDispensed: 0,
      numRefills: 0,
      freeTextDosage: '',
      indication: '',
      orderer: null,
      careSetting: null,
      quantityUnits,
      template: template.template,
    };
  }

  return {
    action: 'NEW',
    display: drug.display,
    drug,
    unit: defaultUnit,
    dosage: null,
    frequency: null,
    route: null,
    commonMedicationName: drug.display,
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: null,
    startDate: new Date(),
    duration: null,
    durationUnit: defaultDurationUnit,
    pillsDispensed: 0,
    numRefills: 0,
    freeTextDosage: '',
    indication: '',
    orderer: null,
    careSetting: null,
    quantityUnits: defaultQuantityUnits,
  };
}
