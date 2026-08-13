import { openmrsFetch, useConfig, fhirBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';

export interface Observation {
  id: string;
  effectiveDateTime: string;
  value: number;
  unit: string;
  code: string;
}

export interface GrowthChartData {
  patient: fhir.Patient;
  weights: Observation[];
}

export function useObservations(patientUuid: string, conceptUuid: string) {
  // Use a high _count (500) to avoid pagination for now.
  // This should cover most patients, but we can add pagination if needed later.
  const apiUrl =
    patientUuid && conceptUuid
      ? `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=${conceptUuid}&_sort=-date&_count=500`
      : null;

  const { data, error, isLoading } = useSWRImmutable<FetchResponse<fhir.Bundle>, Error>(apiUrl, openmrsFetch);

  const observations: Observation[] = (data?.data?.entry?.map((entry) => {
    const resource = entry.resource as fhir.Observation;
    return {
      id: resource.id,
      effectiveDateTime: resource.effectiveDateTime,
      value: resource.valueQuantity?.value,
      unit: resource.valueQuantity?.unit,
      code: resource.code?.coding?.[0]?.code,
    };
  }) || []) as Observation[];

  return {
    observations,
    isLoading,
    isError: error,
  };
}

export function useGrowthChartData(patient: fhir.Patient) {
  const { concepts } = useConfig<ConfigObject>();

  const {
    observations: weights,
    isLoading: isWeightLoading,
    isError: isWeightError,
  } = useObservations(patient?.id, concepts.weightUuid);

  if (!patient) {
    return {
      data: null,
      isLoading: false,
      isError: false,
    };
  }

  const isLoading = isWeightLoading;
  const isError = isWeightError;

  return {
    data: {
      patient,
      weights,
    },
    isLoading,
    isError,
  };
}
