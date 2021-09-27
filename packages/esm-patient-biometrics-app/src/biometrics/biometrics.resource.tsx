import { fhirBaseUrl, FHIRResource, useConfig, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBMI } from './biometrics-helpers';
import useSWR from 'swr';
const pageSize = 100;

export function useBiometrics(patientUuid: string) {
  const { concepts } = useConfig();
  const { data, error, isValidating } = useSWR<{ data: BiometricsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&` +
      `code=${Object.values(concepts).join(',')}&_count=${pageSize}`,
    openmrsFetch,
  );

  const observations = data?.data?.total > 0 ? data.data?.entry?.map((entry) => entry.resource ?? []) : null;

  const muacData = observations?.length
    ? observations.filter((obs: any) => obs.code.coding.some((sys) => sys.code === concepts.muacUuid))
    : [];
  const heightData = observations?.length
    ? observations.filter((obs: any) => obs.code.coding.some((sys) => sys.code === concepts.heightUuid))
    : [];
  const weightData = observations?.length
    ? observations.filter((obs: any) => obs.code.coding.some((sys) => sys.code === concepts.weightUuid))
    : [];

  const formattedDimensions = data?.data?.total > 0 ? formatDimensions(weightData, heightData, muacData) : null;

  return {
    data: data ? formattedDimensions : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

function formatDimensions(heights, weights, muacs) {
  const weightDates = getDatesIssued(weights);
  const heightDates = getDatesIssued(heights);
  const uniqueDates = Array.from(new Set(weightDates?.concat(heightDates))).sort(latestFirst);

  return uniqueDates.map((date: Date | string) => {
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
