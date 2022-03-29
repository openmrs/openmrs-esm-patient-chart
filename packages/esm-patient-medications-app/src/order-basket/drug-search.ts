import uniqBy from 'lodash-es/uniqBy';
import { getDrugByName } from '../api/api';
import { getCommonMedicationByUuid } from '../api/common-medication';
import { OrderBasketItem } from '../types/order-basket-item';
import { Drug } from '../types/order';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

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
const config = useConfig() as ConfigObject;
export async function searchMedications(searchTerm: string, encounterUuid: string, abortController: AbortController) {
  const allSearchTerms = searchTerm.match(/\S+/g);
  const drugs = await searchDrugsInBackend(allSearchTerms, abortController);
  const explodedSearchResults = drugs.flatMap((drug) => [
    ...explodeDrugResultWithCommonMedicationData(drug, encounterUuid),
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

function* explodeDrugResultWithCommonMedicationData(drug: Drug, encounterUuid: string): Generator<OrderBasketItem> {
  const commonMedication = getCommonMedicationByUuid(drug.uuid);

  // If no common medication entry exists for the current drug, there is no point in displaying it in the search results,
  // because the user could not enter medication details anyway (the component requires a common medication entry
  // in order to work correctly).
  if (!commonMedication) {
    return;
  }

  for (const dosageUnit of commonMedication.dosageUnits) {
    for (const dosage of commonMedication.commonDosages) {
      for (const frequency of commonMedication.commonFrequencies) {
        for (const route of commonMedication.route) {
          yield {
            action: 'NEW',
            drug,
            dosage,
            dosageUnit,
            frequency,
            route,
            encounterUuid,
            commonMedicationName: commonMedication.name,
            isFreeTextDosage: false,
            patientInstructions: '',
            asNeeded: false,
            asNeededCondition: '',
            startDate: new Date(),
            duration: null,
            durationUnit: config.daysDurationUnit,
            pillsDispensed: 0,
            numRefills: 0,
            freeTextDosage: '',
            indication: '',
          };
        }
      }
    }
  }
}

function filterExplodedResultsBySearchTerm(allSearchTerms: Array<string>, results: Array<OrderBasketItem>) {
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
