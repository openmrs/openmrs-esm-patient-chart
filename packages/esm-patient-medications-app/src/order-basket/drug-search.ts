import uniqBy from 'lodash-es/uniqBy';
import { getDrugByName, getOrderTemplatesByDrug } from '../api/api';
import { OrderBasketItem } from '../types/order-basket-item';
import { Drug } from '../types/order';
import { DrugOrderTemplate, OrderTemplate } from '../api/drug-order-template';

// Note:
// There's currently no backend API available for the data in `common-medication.json`.
// This means that there's also no external API where we can search for that data.
// This results in us having to simulate a search on the frontend.
// The way this works is that we search all drugs matching the search term(s) in the backend and enrich that drug data
// with the data found in `common-medication.json`. These exploded results are then again filtered with the search term(s).
//
// For example, imagine that we search for "Aspirin 81mg".
// We call the drug endpoint with both "Aspirin" and "81mg" and receive a single drug (Aspirin) for the first term.
// `common-medication.json` now defines a lot of additional data for Aspirin (e.g. 81mg, 243mg, ...).
// -> We explode this info into multiple Aspirin results. But since the user also entered "81mg" as a search term, we
// also slim the final list of search results down again.
//
// This method certainly isn't perfect, but again, since the common medication data is only available to us, it's kind of
// the best thing we can do here.
interface DaysDurationUnit {
  uuid: string;
  display: string;
}

export async function searchMedications(
  searchTerm: string,
  abortController: AbortController,
  daysDurationUnit: DaysDurationUnit,
) {
  const allSearchTerms = searchTerm.match(/\S+/g);
  const drugs = await searchDrugsInBackend(allSearchTerms, abortController);
  const drugToOrderTemplates = (await Promise.all(
    drugs.map(async (drug) => {
      let response: any = null;
      try {
        response = await getOrderTemplatesByDrug(drug.uuid);
      } catch (error) {
        // most likely there is no `Order Template` backend support
        response = { data: { results: [] } }; // empty response
      }
      const orderTemplates = response.data.results.map((ot) => {
        try {
          ot.template = JSON.parse(ot.template);
          return ot;
        } catch (error) {
          console.error(error);
          return null;
        }
      }) as Array<DrugOrderTemplate>;
      return { drug: drug, templates: orderTemplates.filter((x) => !!x) };
    }),
  )) as any as Array<{ drug: Drug; templates: Array<DrugOrderTemplate> }>;
  const explodedSearchResults = drugToOrderTemplates.flatMap(({ drug, templates }) => [
    ...explodeResultWithOrderTemplates(drug, templates, daysDurationUnit),
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
  return template.dosingInstructions[prop].find((x) => x.default) || template.dosingInstructions[prop][0];
}

function* explodeResultWithOrderTemplates(
  drug: Drug,
  templates: Array<DrugOrderTemplate>,
  daysDurationUnit: DaysDurationUnit,
): Generator<OrderBasketItem> {
  if (templates?.length) {
    for (const template of templates) {
      yield {
        action: 'NEW',
        drug,
        unit: getDefault(template.template, 'unit'),
        dosage: getDefault(template.template, 'dose')?.value,
        frequency: getDefault(template.template, 'frequency'),
        route: getDefault(template.template, 'route'),
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

function filterExplodedResultsBySearchTerm(allSearchTerms: Array<string>, results: any) {
  return results.filter((result) =>
    allSearchTerms.every(
      (searchTerm) =>
        includesIgnoreCase(result.drug.name, searchTerm) ||
        includesIgnoreCase(result.dosageUnit.name, searchTerm) ||
        includesIgnoreCase(result.dosage.dosage, searchTerm) ||
        includesIgnoreCase(result.frequency.name, searchTerm) ||
        includesIgnoreCase(result.route.name, searchTerm),
    ),
  );
}

function includesIgnoreCase(a: string, b: string) {
  return a.toLowerCase().includes(b.toLowerCase());
}
