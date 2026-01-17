import { openmrsFetch, useConfig, age, fhirBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';

export interface Observation {
  id: string;
  effectiveDateTime: string;
  value: number;
  unit: string;
  code: string;
}

export interface PatientDemographics {
  name: string;
  gender: string;
  birthDate: string;
  age: string;
}

export interface GrowthChartData {
  patient: PatientDemographics;
  heights: Observation[];
  weights: Observation[];
}

export function usePatient(patientUuid: string) {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<fhir.Patient>, Error>(
    patientUuid ? `${fhirBaseUrl}/Patient/${patientUuid}` : null,
    openmrsFetch,
  );

  return {
    patient: data?.data,
    isLoading,
    isError: error,
  };
}

export function useObservations(patientUuid: string, conceptUuid: string) {
  const apiUrl =
    patientUuid && conceptUuid
      ? `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=${conceptUuid}&_sort=-date&_count=100`
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

export function useGrowthChartData(patientUuid: string) {
  const { concepts } = useConfig<ConfigObject>();

  const { patient, isLoading: isPatientLoading, isError: isPatientError } = usePatient(patientUuid);

  const {
    observations: heights,
    isLoading: isHeightLoading,
    isError: isHeightError,
  } = useObservations(patientUuid, concepts.heightUuid);

  const {
    observations: weights,
    isLoading: isWeightLoading,
    isError: isWeightError,
  } = useObservations(patientUuid, concepts.weightUuid);

  const isLoading = isPatientLoading || isHeightLoading || isWeightLoading;
  const isError = isPatientError || isHeightError || isWeightError;

  let patientDemographics: PatientDemographics | undefined;

  if (patient) {
    patientDemographics = {
      name: patient.name?.[0]?.text || '',
      gender: patient.gender || 'unknown',
      birthDate: patient.birthDate || '',
      age: patient.birthDate ? age(patient.birthDate) : '',
    };
  }

  return {
    data: {
      patient: patientDemographics,
      heights,
      weights,
    },
    isLoading,
    isError,
  };
}
