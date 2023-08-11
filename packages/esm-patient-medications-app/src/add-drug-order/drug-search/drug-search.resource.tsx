import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import type { DrugOrderTemplate, OrderTemplate } from '../../api/drug-order-template';
import type { Drug } from '../../types/order';
import type { OrderBasketItem } from '../../types/order-basket-item';

export function useDrugSearch(query): {
  isLoading: boolean;
  drugs: Array<Drug>;
  error: Error;
} {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<{ results: Array<Drug> }>, Error>(
    query
      ? `/ws/rest/v1/drug?q=${query}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      isLoading,
      drugs: data?.data?.results,
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
      templates: data?.data?.results?.map((drug) => ({
        ...drug,
        template: JSON.parse(drug.template) as OrderTemplate,
      })),
      error: error,
    }),
    [data, error, isLoading],
  );
  return results;
}

export function getDefault(template: OrderTemplate, prop: string) {
  return template.dosingInstructions[prop]?.find((x) => x.default) || template.dosingInstructions[prop]?.[0];
}

export function getTemplateOrderBasketItem(
  drug: Drug,
  configDefaultDurationConcept: {
    uuid: string;
    display: string;
  },
  template: DrugOrderTemplate = null,
): OrderBasketItem {
  return template
    ? {
        action: 'NEW',
        drug,
        unit:
          getDefault(template.template, 'unit') ?? drug?.dosageForm
            ? {
                value: drug?.dosageForm?.display,
                valueCoded: drug?.dosageForm?.uuid,
              }
            : null,
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
        durationUnit: configDefaultDurationConcept
          ? {
              value: configDefaultDurationConcept?.display,
              valueCoded: configDefaultDurationConcept?.uuid,
            }
          : null,
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
        template: template.template,
        orderer: null,
        careSetting: null,
        quantityUnits:
          getDefault(template.template, 'quantityUnits') ?? drug?.dosageForm
            ? {
                value: drug?.dosageForm?.display,
                valueCoded: drug?.dosageForm?.uuid,
              }
            : null,
      }
    : {
        action: 'NEW',
        drug,
        unit: drug?.dosageForm
          ? {
              value: drug?.dosageForm?.display,
              valueCoded: drug?.dosageForm?.uuid,
            }
          : null,
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
        durationUnit: configDefaultDurationConcept
          ? {
              value: configDefaultDurationConcept?.display,
              valueCoded: configDefaultDurationConcept?.uuid,
            }
          : null,
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
        orderer: null,
        careSetting: null,
        quantityUnits: drug?.dosageForm
          ? {
              value: drug?.dosageForm?.display,
              valueCoded: drug?.dosageForm?.uuid,
            }
          : null,
      };
}
