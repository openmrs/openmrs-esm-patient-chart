import uniqBy from 'lodash-es/uniqBy';
import { getDrugByName, getOrderTemplatesByDrug } from '../api/api';
import { OrderBasketItem } from '../types/order-basket-item';
import { Drug } from '../types/order';
import { DrugOrderTemplate, OrderTemplate } from '../api/drug-order-template';

interface DaysDurationUnit {
  uuid: string;
  display: string;
}
export async function searchMedications(
  searchTerm: string,
  encounterUuid: string,
  abortController: AbortController,
  daysDurationUnit: DaysDurationUnit,
) {
  const allSearchTerms = searchTerm.match(/\S+/g);
  const drugs = await searchDrugsInBackend(allSearchTerms, abortController);
  const drugToOrderTemplates: Array<{ drug: Drug; templates: Array<DrugOrderTemplate> }> = await Promise.all(
    drugs.map(async (drug) => {
      let response = null;
      try {
        response = await getOrderTemplatesByDrug(drug.uuid);
      } catch (error) {
        // most likely there is no `Order Template` backend support
        response = { data: { results: [] } }; // empty response
      }

      const orderTemplates: Array<DrugOrderTemplate> = response.data.results.map((orderTemplate) => {
        try {
          orderTemplate.template = JSON.parse(orderTemplate.template);
          return orderTemplate;
        } catch (error) {
          console.error(error);
          return null;
        }
      });

      return { drug: drug, templates: orderTemplates.filter((x) => !!x) };
    }),
  );

  const explodedSearchResults = drugToOrderTemplates.flatMap(({ drug, templates }) => [
    ...explodeResultWithOrderTemplates(drug, templates, encounterUuid, daysDurationUnit),
  ]);
  return filterExplodedResultsBySearchTerm(allSearchTerms, explodedSearchResults);
}

async function searchDrugsInBackend(allSearchTerms: Array<string>, abortController: AbortController) {
  const resultsPerSearchTerm = await Promise.all(
    allSearchTerms.map(async (searchTerm) => {
      const res = await getDrugByName(searchTerm, abortController);
      return res.data.results;
    }),
  );
  const results = resultsPerSearchTerm.flatMap((x) => x);
  return uniqBy(results, 'uuid');
}

function getDefault(template: OrderTemplate, prop: string) {
  return template.dosingInstructions[prop].filter((x) => x.default)[0] || template.dosingInstructions[prop][0];
}

function* explodeResultWithOrderTemplates(
  drug: Drug,
  templates: Array<DrugOrderTemplate>,
  encounterUuid: string,
  daysDurationUnit: DaysDurationUnit,
): Generator<OrderBasketItem> {
  if (templates?.length) {
    for (const template of templates) {
      yield {
        action: 'NEW',
        drug,
        unit: getDefault(template.template, 'unit'),
        dosage: getDefault(template.template, 'dose'),
        frequency: getDefault(template.template, 'frequency'),
        route: getDefault(template.template, 'route'),
        encounterUuid,
        commonMedicationName: drug.name,
        isFreeTextDosage: false,
        patientInstructions: '',
        asNeeded: template.template.dosingInstructions.asNeeded || false,
        asNeededCondition: template.template.dosingInstructions.asNeededCondition,
        startDate: new Date(),
        duration: null,
        durationUnit: daysDurationUnit,
        pillsDispensed: 0,
        numRefills: 0,
        freeTextDosage: '',
        indication: '',
        template: template.template,
        orderer: null,
        careSetting: null,
        quantityUnits: null,
      };
    }
  } else {
    yield {
      action: 'NEW',
      drug,
      unit: null,
      dosage: null,
      frequency: null,
      route: null,
      encounterUuid,
      commonMedicationName: drug.name,
      isFreeTextDosage: false,
      patientInstructions: '',
      asNeeded: false,
      asNeededCondition: null,
      startDate: new Date(),
      duration: null,
      durationUnit: daysDurationUnit,
      pillsDispensed: 0,
      numRefills: 0,
      freeTextDosage: '',
      indication: '',
      orderer: null,
      careSetting: null,
      quantityUnits: null,
    };
  }
}

function filterExplodedResultsBySearchTerm(allSearchTerms: Array<string>, results) {
  return results.filter((result) =>
    allSearchTerms.every(
      (searchTerm) =>
        includesIgnoreCase(result?.drug?.name, searchTerm) ||
        includesIgnoreCase(result?.dosageUnit?.name, searchTerm) ||
        includesIgnoreCase(result?.dosage?.dosage, searchTerm) ||
        includesIgnoreCase(result?.frequency?.name, searchTerm) ||
        includesIgnoreCase(result?.route?.name, searchTerm),
    ),
  );
}

function includesIgnoreCase(a: string, b: string): boolean {
  return a?.toLowerCase()?.includes(b?.toLowerCase());
}
