import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Drug } from '@openmrs/esm-patient-common-lib';
import { type DrugOrderBasketItem, type DrugOrderTemplate, type OrderTemplate } from '../../types';

export interface DrugSearchResult {
  concept: {
    display: string;
    uuid: string;
  };
  display: string;
  dosageForm: {
    display: string;
    uuid: string;
  };
  name: string;
  strength: string;
  uuid: string;
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
        dateActivated: new Date(),
        asNeeded: template.template.dosingInstructions.asNeeded || false,
        asNeededCondition: template.template.dosingInstructions.asNeededCondition,
        careSetting: null,
        commonMedicationName: drug.display,
        display: drug.display,
        dosage: getDefault(template.template, 'dose')?.value,
        drug,
        duration: null,
        durationUnit: configDefaultDurationConcept
          ? {
              value: configDefaultDurationConcept?.display,
              valueCoded: configDefaultDurationConcept?.uuid,
            }
          : null,
        freeTextDosage: '',
        frequency: getDefault(template.template, 'frequency'),
        indication: '',
        isFreeTextDosage: false,
        numRefills: 0,
        orderer: null,
        patientInstructions: '',
        pillsDispensed: 0,
        quantityUnits:
          getDefault(template.template, 'quantityUnits') ?? drug?.dosageForm
            ? {
                value: drug?.dosageForm?.display,
                valueCoded: drug?.dosageForm?.uuid,
              }
            : null,
        route: getDefault(template.template, 'route'),
        template: template.template,
        unit:
          getDefault(template.template, 'unit') ?? drug?.dosageForm
            ? {
                value: drug?.dosageForm?.display,
                valueCoded: drug?.dosageForm?.uuid,
              }
            : null,
      }
    : {
        action: 'NEW',
        dateActivated: new Date(),
        asNeeded: false,
        asNeededCondition: null,
        careSetting: null,
        commonMedicationName: drug.display,
        display: drug.display,
        dosage: null,
        drug,
        duration: null,
        durationUnit: configDefaultDurationConcept
          ? {
              value: configDefaultDurationConcept?.display,
              valueCoded: configDefaultDurationConcept?.uuid,
            }
          : null,
        frequency: null,
        freeTextDosage: '',
        indication: '',
        isFreeTextDosage: false,
        numRefills: 0,
        orderer: null,
        patientInstructions: '',
        pillsDispensed: 0,
        quantityUnits: drug?.dosageForm
          ? {
              value: drug?.dosageForm?.display,
              valueCoded: drug?.dosageForm?.uuid,
            }
          : null,
        route: null,
        unit: drug?.dosageForm
          ? {
              value: drug?.dosageForm?.display,
              valueCoded: drug?.dosageForm?.uuid,
            }
          : null,
      };
}
