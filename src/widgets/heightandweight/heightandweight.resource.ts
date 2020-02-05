import { openmrsObservableFetch } from "@openmrs/esm-api";
import { map } from "rxjs/operators";
import { formatDate, calculateBMI } from "./heightandweight-helper";

const HEIGHT_CONCEPT = "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const WEIGHT_CONCEPT = "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function getDimensions(patientId: string) {
  return getDimensionsObservations(patientId).pipe(
    map(data => (data ? formatDimensions(data.weights, data.heights) : []))
  );
}

function getDimensionsObservations(patientId: string) {
  return openmrsObservableFetch(
    `/ws/fhir/Observation?subject:Patient=${patientId}&code=${WEIGHT_CONCEPT},${HEIGHT_CONCEPT}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => {
      if (entries) {
        const dimensions = entries.map(entry => entry.resource);
        return {
          heights: dimensions.filter(dimension =>
            dimension.code.coding.some(sys => sys.code === HEIGHT_CONCEPT)
          ),
          weights: dimensions.filter(dimension =>
            dimension.code.coding.some(sys => sys.code === WEIGHT_CONCEPT)
          )
        };
      }
    })
  );
}

export function getDimenionsObservationsRestAPI(patientUuid: string) {
  return openmrsObservableFetch(
    `/ws/rest/v1/obs?concepts=${WEIGHT_CONCEPT},${HEIGHT_CONCEPT}&patient=${patientUuid}&v=custom:(uuid,display,obsDatetime,encounter:(encounterDatetime),value,concept:(uuid))`
  ).pipe(
    map((response: any) => {
      return {
        heights: response.data.results.filter(
          response => response.concept.uuid === HEIGHT_CONCEPT
        ),
        weights: response.data.results.filter(
          response => response.concept.uuid === WEIGHT_CONCEPT
        )
      };
    }),
    map(data => {
      return data.heights
        ? formatDimensionsRestAPI(data.weights, data.heights)
        : [];
    })
  );
}

function formatDimensionsRestAPI(weights, heights) {
  const weightDates = weights.map(weight => weight.obsDatetime);
  const heightDates = heights.map(height => height.obsDatetime);

  const uniqueDates = Array.from(new Set(weightDates.concat(heightDates))).sort(
    latestFirst
  );

  return uniqueDates.map((date: any) => {
    const weight = weights.find(weight => weight.obsDatetime === date);
    const height = heights.find(height => height.obsDatetime === date);
    return {
      id: new Date(date).getTime(),
      weight: weight ? weight.value : weight,
      height: height ? height.value : height,
      date: formatDate(date),
      bmi: weight && height ? calculateBMI(weight.value, height.value) : null
    };
  });
}

function formatDimensions(weights, heights) {
  const weightDates = getDatesIssued(weights);
  const heightDates = getDatesIssued(heights);
  const uniqueDates = Array.from(new Set(weightDates.concat(heightDates))).sort(
    latestFirst
  );

  return uniqueDates.map(date => {
    const weight = weights.find(weight => weight.issued === date);
    const height = heights.find(height => height.issued === date);
    return {
      id: new Date(date).getTime(),
      weight: weight ? weight.valueQuantity.value : weight,
      height: height ? height.valueQuantity.value : height,
      date: formatDate(date),
      bmi:
        weight && height
          ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value)
          : null
    };
  });
}

function latestFirst(a, b) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function getDatesIssued(dimensionArray): string[] {
  return dimensionArray.map(dimension => dimension.issued);
}
