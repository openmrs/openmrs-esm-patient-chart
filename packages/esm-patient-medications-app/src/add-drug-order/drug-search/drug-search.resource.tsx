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

interface ConceptSetMembersResponse {
  uuid: string;
  setMembers?: Array<{
    uuid: string;
    name: {
      display: string;
    };
  }>;
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

// Limit the number of concurrent drug searches when fetching drugs by concept set
const maxConcurrentDrugSearches = 10;
// Representation string for drug search results
const drugSearchRepresentation = 'custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))';

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

async function fetchDrugsByConceptSet(conceptSetUuid: string): Promise<DrugListFetchResult> {
  // First, fetch the concept set members
  const conceptSetResponse = await openmrsFetch<ConceptSetMembersResponse>(
    `${restBaseUrl}/concept/${conceptSetUuid}?v=custom:(uuid,setMembers:(uuid,name))`,
  );

  const memberNames = conceptSetResponse.data?.setMembers?.map((member) => member.name?.display).filter(Boolean) ?? [];

  if (memberNames.length === 0) {
    return { drugs: [], hasFailures: false };
  }

  // Fetch drugs for each concept name with a small concurrency cap.
  const drugs: Array<DrugSearchResult> = [];
  let hasFailures = false;
  for (let start = 0; start < memberNames.length; start += maxConcurrentDrugSearches) {
    const batch = memberNames.slice(start, start + maxConcurrentDrugSearches);
    const requests = batch.map((name) =>
      openmrsFetch<{ results: Array<DrugSearchResult> }>(
        `${restBaseUrl}/drug?q=${encodeURIComponent(name)}&v=${drugSearchRepresentation}`,
      ),
    );
    const settled = await Promise.allSettled(requests);
    if (settled.some((result) => result.status === 'rejected')) {
      hasFailures = true;
    }
    const batchDrugs = settled
      .filter(
        (result): result is PromiseFulfilledResult<FetchResponse<{ results: Array<DrugSearchResult> }>> =>
          result.status === 'fulfilled',
      )
      .flatMap((result) => result.value?.data?.results ?? []);
    drugs.push(...batchDrugs);
  }

  // Dedupe by drug uuid
  const deduped = Array.from(new Map(drugs.map((drug) => [drug.uuid, drug])).values());

  return { drugs: deduped, hasFailures };
}

export function useDrugBrowseByConceptSet(conceptSetUuid: string) {
  const { data, isLoading } = useSWRImmutable(conceptSetUuid ? ['drug-browse', conceptSetUuid] : null, () =>
    fetchDrugsByConceptSet(conceptSetUuid),
  );

  return {
    drugs: data?.drugs ?? [],
    hasFailures: data?.hasFailures ?? false,
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
