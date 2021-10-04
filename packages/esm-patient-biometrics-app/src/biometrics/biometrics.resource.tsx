import useSWR from 'swr';
import { fhirBaseUrl, FHIRResource, useConfig, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBMI } from './biometrics-helpers';

export const pageSize = 100;

type Biometrics = Array<FHIRResource['resource']>;

export function useBiometrics(patientUuid: string) {
  const { concepts } = useConfig();

  const { data, error, isValidating } = useSWR<{ data: BiometricsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&` +
      `code=${Object.values(concepts).join(',')}&_count=${pageSize}`,
    openmrsFetch,
  );

  const filterByConceptUuid = (biometrics: Biometrics, conceptUuid: string) => {
    return biometrics.filter((obs) => obs.code.coding.some((c) => c.code === conceptUuid));
  };

  const observations: Biometrics = data?.data?.entry?.map((entry) => entry.resource) ?? [];

  return {
    data:
      data?.data?.total > 0
        ? formatDimensions(
            filterByConceptUuid(observations, concepts.muacUuid),
            filterByConceptUuid(observations, concepts.heightUuid),
            filterByConceptUuid(observations, concepts.weightUuid),
          )
        : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

function formatDimensions(heights: Biometrics, weights: Biometrics, muacs: Biometrics): Array<PatientBiometrics> {
  const weightDates = getDatesIssued(weights);
  const heightDates = getDatesIssued(heights);
  const uniqueDates = Array.from(new Set(weightDates?.concat(heightDates))).sort(latestFirst);

  return uniqueDates.map((date: Date | string) => {
    const muac = muacs.find((muac) => muac.issued === date);
    const weight = weights.find((weight) => weight.issued === date);
    const height = heights.find((height) => height.issued === date);
    return {
      id: weight?.encounter?.reference?.replace('Encounter/', ''),
      weight: weight?.valueQuantity?.value,
      height: height?.valueQuantity?.value,
      date: date,
      bmi: weight && height ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value) : null,
      obsData: {
        weight: weight,
        height: height,
      },
      muac: muac?.valueQuantity?.value,
    };
  });
}

function latestFirst(a, b) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function getDatesIssued(dimensionArray): string[] {
  return dimensionArray?.map((dimension) => dimension.issued);
}

interface BiometricsFetchResponse {
  id: string;
  entry: Array<FHIRResource>;
  resourceType: string;
  total: number;
  type: string;
}

export interface PatientBiometrics {
  id: string;
  date: string | Date;
  weight: number;
  height: number;
  bmi: number | null;
  muac: number;
}
