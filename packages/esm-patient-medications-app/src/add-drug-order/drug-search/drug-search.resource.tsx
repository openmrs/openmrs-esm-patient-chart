import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl, useFeatureFlag, type Visit } from '@openmrs/esm-framework';
import {
  type Drug,
  type DrugOrderBasketItem,
  type DrugOrderTemplate,
  type OrderTemplate,
} from '@openmrs/esm-patient-common-lib';

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

interface OrderTemplateResource {
  uuid: string;
  drug: Drug;
  name: string;
  template: string;
}

/**
 * Search for a list of drugs based on the given query string
 * @param query
 * @returns
 */
export function useDrugSearch(query: string) {
  const { data, ...rest } = useSWRImmutable<FetchResponse<{ results: Array<DrugSearchResult> }>, Error>(
    query
      ? `${restBaseUrl}/drug?q=${query}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      drugs: data?.data?.results,
      ...rest,
    }),
    [data, rest],
  );

  return results;
}

/**
 * Search for a list of order templates associated with the given drug.
 * Requires the ordertemplates module installed to work properly.
 * @param drugUuid
 * @returns
 */
export function useDrugTemplate(drugUuid: string): {
  isLoading: boolean;
  templates: Array<DrugOrderTemplate>;
  error: Error;
} {
  const isOrderTemplatesModuleInstalled = useFeatureFlag('ordertemplates-module');
  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<{
      results: Array<OrderTemplateResource>;
    }>,
    Error
  >(
    isOrderTemplatesModuleInstalled && drugUuid ? `${restBaseUrl}/ordertemplates/orderTemplate?drug=${drugUuid}` : null,
    openmrsFetch,
  );

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

/**
 * Search for a list of order templates associated with drugs in the given array
 * Requires the ordertemplates module installed to work properly.
 *
 * Note: This hook is inefficient as it makes a request for each uuid. Having a
 * backend search handler that supports passing in multiple drug uuids will fix that.
 * See: https://openmrs.atlassian.net/browse/OEUI-312
 * @param drugUuids
 * @returns a Map mapping each drug uuid to a list of associated order templates
 */
export function useDrugTemplates(drugs: Drug[]) {
  const drugUuids = drugs?.map((d) => d.uuid);
  const isOrderTemplatesModuleInstalled = useFeatureFlag('ordertemplates-module');
  const { data, ...rest } = useSWRImmutable<FetchResponse<OrderTemplateResource>[], Error>(
    isOrderTemplatesModuleInstalled ? drugUuids : null,
    (drugUuids: string[]) => {
      return Promise.all(
        drugUuids.map((drugUuid) => {
          return openmrsFetch<OrderTemplateResource>(`${restBaseUrl}/ordertemplates/orderTemplate?drug=${drugUuid}`);
        }),
      );
    },
  );

  const templateByDrugUuid = useMemo(() => {
    const templateByDrugUuid: Map<string, DrugOrderTemplate[]> = new Map();
    for (const d of data ?? []) {
      if (d.data?.drug) {
        const key = d.data.drug.uuid;
        if (!templateByDrugUuid.has(key)) {
          templateByDrugUuid.set(key, []);
        }
        templateByDrugUuid.get(key).push({
          ...d.data,
          template: JSON.parse(d.data.template) as OrderTemplate,
        });
      }
    }
    return templateByDrugUuid;
  }, [data]);

  return { templateByDrugUuid, ...rest };
}

export function getDefault(template: OrderTemplate, prop: string) {
  return template.dosingInstructions[prop]?.find((x) => x.default) || template.dosingInstructions[prop]?.[0];
}

export function getTemplateOrderBasketItem(
  drug: DrugSearchResult,
  visit: Visit,
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
        pillsDispensed: null,
        numRefills: null,
        freeTextDosage: '',
        indication: '',
        template: template.template,
        quantityUnits:
          getDefault(template.template, 'quantityUnits') ?? drug?.dosageForm
            ? {
                value: drug?.dosageForm?.display,
                valueCoded: drug?.dosageForm?.uuid,
              }
            : null,
        visit,
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
        pillsDispensed: null,
        numRefills: null,
        freeTextDosage: '',
        indication: '',
        quantityUnits: drug?.dosageForm
          ? {
              value: drug?.dosageForm?.display,
              valueCoded: drug?.dosageForm?.uuid,
            }
          : null,
        visit,
      };
}
