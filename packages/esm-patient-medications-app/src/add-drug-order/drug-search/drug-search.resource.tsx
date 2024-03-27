import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
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
      ? `${restBaseUrl}/drug?q=${query}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
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
  >(drugUuid ? `${restBaseUrl}/ordertemplates/orderTemplate?drug=${drugUuid}` : null, openmrsFetch);

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
  drug: DrugSearchResult,
  configDefaultDurationConcept?: {
    uuid: string;
    display: string;
  },
  template?: DrugOrderTemplate,
): DrugOrderBasketItem {
  return template
    ? {
        action: 'NEW',
        display: drug.display,
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
        display: drug.display,
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
