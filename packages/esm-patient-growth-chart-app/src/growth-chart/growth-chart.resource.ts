import { useMemo } from 'react';
import { openmrsFetch, useConfig, fhirBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';

export interface Observation {
  id?: string;
  effectiveDateTime?: string;
  value?: number;
  unit?: string;
  code?: string;
}

export interface GrowthChartData {
  patient: fhir.Patient;
  weights: Observation[];
}

const isFhirObservation = (resource: fhir.Resource | undefined): resource is fhir.Observation =>
  resource?.resourceType === 'Observation';

export function useObservations(patientUuid?: string, conceptUuid?: string) {
  // Use a high _count (500) to avoid pagination for now.
  // This should cover most patients, but we can add pagination if needed later.
  const apiUrl =
    patientUuid && conceptUuid
      ? `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=${conceptUuid}&_sort=-date&_count=500`
      : null;

  const { data, error, isLoading } = useSWRImmutable<FetchResponse<fhir.Bundle>, Error>(apiUrl, openmrsFetch);

  const observations = useMemo(
    () =>
      data?.data?.entry?.flatMap(({ resource }) => {
        if (!isFhirObservation(resource)) {
          return [];
        }

        return [
          {
            id: resource.id,
            effectiveDateTime: resource.effectiveDateTime,
            value: resource.valueQuantity?.value,
            unit: resource.valueQuantity?.unit,
            code: resource.code?.coding?.[0]?.code,
          },
        ];
      }) ?? [],
    [data],
  );

  return {
    observations,
    isLoading,
    error,
  };
}

export function useGrowthChartData(patient?: fhir.Patient) {
  const { concepts } = useConfig<ConfigObject>();

  const {
    observations: weights,
    isLoading: isWeightLoading,
    error,
  } = useObservations(patient?.id, concepts.weightUuid);

  if (!patient) {
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }

  return {
    data: {
      patient,
      weights,
    },
    isLoading: isWeightLoading,
    error,
  };
}
