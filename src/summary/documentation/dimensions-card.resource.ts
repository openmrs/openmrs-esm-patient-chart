import { openmrsObservableFetch } from "@openmrs/esm-api";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { formatDate, calculateBMI } from "./dimension-helpers";

const HEIGHT_CONCEPT = "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const WEIGHT_CONCEPT = "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function getDimensions(patientId: string) {
  return forkJoin({
    weights: getDimensionObservations(patientId, "weight"),
    heights: getDimensionObservations(patientId, "height")
  }).pipe(map(data => formatDimensions(data.weights, data.heights)));
}

function getDimensionObservations(
  patientId: string,
  type: "weight" | "height"
) {
  const concept = type === "weight" ? WEIGHT_CONCEPT : HEIGHT_CONCEPT;
  return openmrsObservableFetch(
    `/ws/fhir/Observation?subject:Patient=${patientId}&code=${concept}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries.map(entry => entry.resource))
  );
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
