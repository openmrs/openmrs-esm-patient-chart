import { openmrsObservableFetch, fhirBaseUrl, FHIRResource } from '@openmrs/esm-framework';
import { map } from 'rxjs/operators';
import { calculateBMI } from './biometric.helper';

export function getPatientBiometrics(weightUuid: string, heightUuid: string, patientId: string, muacUuid: string) {
  return getPatientBiometricObservations(weightUuid, heightUuid, patientId, muacUuid).pipe(
    map((data) => (data ? formatDimensions(data.weights, data.heights, data.muac) : [])),
  );
}

function getPatientBiometricObservations(weightUuid: string, heightUuid: string, patientId: string, muacUuid: string) {
  const DEFAULT_PAGE_SIZE = 100;
  return openmrsObservableFetch<DimensionFetchResponse>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientId}&code=${weightUuid},${heightUuid},${muacUuid}&_count=${DEFAULT_PAGE_SIZE}`,
  ).pipe(
    map(({ data }) => data.entry),
    map((entries) => entries?.map((entry) => entry.resource)),
    map((dimensions) => {
      return {
        muac: dimensions?.filter((dimension) => dimension.code.coding.some((sys) => sys.code === muacUuid)),
        heights: dimensions?.filter((dimension) => dimension.code.coding.some((sys) => sys.code === heightUuid)),
        weights: dimensions?.filter((dimension) => dimension.code.coding.some((sys) => sys.code === weightUuid)),
      };
    }),
  );
}
function formatDimensions(weights, heights, muacs) {
  const weightDates = getDatesIssued(weights);
  const heightDates = getDatesIssued(heights);
  const uniqueDates = Array.from(new Set(weightDates?.concat(heightDates))).sort(latestFirst);

  return uniqueDates.map((date) => {
    const muac = muacs.find((muac) => muac.issued === date);
    const weight = weights.find((weight) => weight.issued === date);
    const height = heights.find((height) => height.issued === date);
    return {
      id: weight && weight?.encounter?.reference?.replace('Encounter/', ''),
      weight: weight ? weight.valueQuantity.value : weight,
      height: height ? height.valueQuantity.value : height,
      date: date,
      bmi: weight && height ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value) : null,
      obsData: {
        weight: weight,
        height: height,
      },
      muac: muac?.valueQuantity.value,
    };
  });
}

function latestFirst(a, b) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function getDatesIssued(dimensionArray): string[] {
  return dimensionArray?.map((dimension) => dimension.issued);
}

type DimensionFetchResponse = {
  entry: Array<FHIRResource>;
  id: string;
  resourceType: string;
  total: number;
  type: string;
};
