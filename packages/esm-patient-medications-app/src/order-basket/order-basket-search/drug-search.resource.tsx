import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { DrugOrderTemplate, OrderTemplate } from '../../api/drug-order-template';
import { ConfigConcept } from '../../config-schema';
import { Drug } from '../../types/order';
import { OrderBasketItem } from '../../types/order-basket-item';

export function useDrugSearch(query): {
  isLoading: boolean;
  drugs: Array<Drug>;
  error: Error;
} {
  const { data, error } = useSWRImmutable<FetchResponse<{ results: Array<Drug> }>, Error>(
    query
      ? `/ws/rest/v1/drug?q=${query}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      isLoading: !data && !error,
      drugs: data?.data?.results,
      error,
    }),
    [data, error],
  );

  return results;
}

export function useDrugTemplate(drugUuid: string): {
  isLoading: boolean;
  templates: Array<DrugOrderTemplate>;
  error: Error;
} {
  const { data, error } = useSWRImmutable<
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
      isLoading: !data && !error,
      templates: data?.data?.results?.map((drug) => ({
        ...drug,
        template: JSON.parse(drug.template) as OrderTemplate,
      })),
      error: error,
    }),
    [data, error],
  );
  return results;
}

export function getDefault(template: OrderTemplate, prop: string) {
  return template.dosingInstructions[prop].find((x) => x.default) || template.dosingInstructions[prop][0];
}

export function getTemplateOrderBasketItem(
  drug: Drug,
  configDefaultDurationConcept: ConfigConcept,
  configDefaultDrugRouteConcept: ConfigConcept,
  configDefaultOrderFrequencyConcept: ConfigConcept,
  template: DrugOrderTemplate = null,
): OrderBasketItem {
  return template
    ? {
        action: 'NEW',
        drug,
        unit: getDefault(template.template, 'unit'),
        dosage: getDefault(template.template, 'dose')?.value,
        frequency: getDefault(template.template, 'frequency'),
        route: getDefault(template.template, 'route'),
        commonMedicationName: drug.display,
        isFreeTextDosage: false,
        patientInstructions: '',
        asNeeded: template.template.dosingInstructions.asNeeded || false,
        asNeededCondition: template.template.dosingInstructions.asNeededCondition,
        startDate: new Date(),
        duration: null,
        durationUnit: configDefaultDurationConcept,
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
        template: template.template,
        orderer: null,
        careSetting: null,
        quantityUnits: getDefault(template.template, 'quantityUnits'),
      }
    : {
        action: 'NEW',
        drug,
        unit: {
          value: drug?.dosageForm?.display,
          valueCoded: drug?.dosageForm?.uuid,
        },
        dosage: null,
        frequency: {
          value: configDefaultOrderFrequencyConcept?.display,
          valueCoded: configDefaultOrderFrequencyConcept?.uuid,
        },
        route: {
          value: configDefaultDrugRouteConcept?.display,
          valueCoded: configDefaultDrugRouteConcept?.uuid,
        },
        commonMedicationName: drug.display,
        isFreeTextDosage: false,
        patientInstructions: '',
        asNeeded: false,
        asNeededCondition: null,
        startDate: new Date(),
        duration: null,
        durationUnit: configDefaultDurationConcept,
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
        orderer: null,
        careSetting: null,
        quantityUnits: {
          value: drug?.dosageForm?.display,
          valueCoded: drug?.dosageForm?.uuid,
        },
      };
}
