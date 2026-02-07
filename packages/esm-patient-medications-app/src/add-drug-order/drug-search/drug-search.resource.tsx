import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
  showSnackbar,
  useFeatureFlag,
  type Visit,
} from '@openmrs/esm-framework';
import {
  type Drug,
  type DrugOrderBasketItem,
  type DrugOrderTemplate,
  type OrderTemplate,
} from '@openmrs/esm-patient-common-lib';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

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

export interface ConceptTreeNode {
  uuid: string;
  display: string;
  isSet: boolean;
  setMembers?: Array<ConceptTreeNode>;
}

export interface ConceptSet {
  uuid: string;
  display: string;
}

interface ConceptFetchResponse {
  [uuid: string]: ConceptSet;
}

interface OrderTemplateResource {
  uuid: string;
  drug: Drug;
  name: string;
  template: string;
}

interface DrugListFetchResult {
  drugs: Array<DrugSearchResult>;
  hasFailures: boolean;
}

const maxConceptsPerRequest = 20;
const drugSearchRepresentation = 'custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))';

/**
 * Search for a list of drugs based on the given query string or concepts (uuid/name/mapping)
 * @param query
 * @returns
 */
export function useDrugSearch(query: string, searchBy: 'name' | 'concepts' = 'name') {
  const param = searchBy === 'concepts' ? 'concepts' : 'q';
  const url = query ? `${restBaseUrl}/drug?${param}=${query}&v=${drugSearchRepresentation}` : null;

  const { data, ...rest } = useSWRImmutable<FetchResponse<{ results: Array<DrugSearchResult> }>, Error>(
    url,
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

export function useConceptTree(conceptUuid: string) {
  const fetcher = (url: string) => openmrsFetch<ConceptTreeNode>(url).then((res) => res.data);

  const { data, error, isLoading } = useSWRImmutable<ConceptTreeNode, Error>(
    conceptUuid ? `${restBaseUrl}/concepttree?concept=${conceptUuid}` : null,
    fetcher,
  );

  return {
    tree: data,
    isLoading,
    isError: error,
  };
}

export function useDrugsByConcepts(concepts: string[]) {
  const shouldFetch = concepts && concepts.length > 0;
  const cacheKey = shouldFetch ? ['drugs-by-uuids', ...concepts.sort()] : null;

  const { data, error, isLoading } = useSWRImmutable<DrugListFetchResult, Error>(cacheKey, async () => {
    if (!concepts.length) return { drugs: [], hasFailures: false };

    const drugs: Array<DrugSearchResult> = [];
    let hasFailures = false;

    for (let start = 0; start < concepts.length; start += maxConceptsPerRequest) {
      const batch = concepts.slice(start, start + maxConceptsPerRequest);
      const conceptsParam = batch.join(',');
      try {
        const response = await openmrsFetch<{ results: Array<DrugSearchResult> }>(
          `${restBaseUrl}/drug?concepts=${conceptsParam}&v=${drugSearchRepresentation}`,
        );
        if (response.data?.results) {
          drugs.push(...response.data.results);
        }
      } catch (e) {
        console.error(e);
        hasFailures = true;
      }
    }

    const deduped = Array.from(new Map(drugs.map((drug) => [drug.uuid, drug])).values());

    return { drugs: deduped, hasFailures };
  });

  return {
    drugs: data?.drugs ?? [],
    hasFailures: data?.hasFailures ?? false,
    isLoading,
    error,
  };
}

export function useConceptSets(conceptSetUuids: string[] = []) {
  const url =
    conceptSetUuids.length > 0
      ? `${restBaseUrl}/conceptreferences?references=${conceptSetUuids.join(',')}&v=custom:(uuid,display)`
      : null;

  const { data, error, isLoading } = useSWRImmutable<{ data: ConceptFetchResponse }, Error>(url, openmrsFetch);

  const conceptSets: ConceptSet[] = data?.data
    ? Object.values(data.data).map((concept) => ({
        uuid: concept.uuid,
        display: concept.display,
      }))
    : [];

  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }

  return {
    conceptSets,
    isLoading,
  };
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
