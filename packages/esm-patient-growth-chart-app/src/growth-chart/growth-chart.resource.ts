import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, useConfig, fhirBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';
import { type ChartDatum, getPatientSeries } from './growth-chart.utils';

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

/**
 * Loads the WHO weight-for-age reference percentiles for the given gender. The WHO data is only fetched
 * when first requested. Returns an empty array for genders without WHO reference data.
 */
export const getReferenceSeries = async (gender?: string): Promise<Array<ChartDatum>> => {
  const supportedGender = gender?.toLowerCase();
  const whoData =
    supportedGender === 'female'
      ? (await import('../who-data/girls/weight-for-age.json')).default
      : supportedGender === 'male'
        ? (await import('../who-data/boys/weight-for-age.json')).default
        : null;

  if (!whoData) {
    return [];
  }

  const referenceSeries: Array<ChartDatum> = [];
  const percentiles = ['P3', 'P15', 'P50', 'P85', 'P97'];

  whoData.forEach((point) => {
    percentiles.forEach((p) => {
      referenceSeries.push({
        group: p,
        age: point.age_months,
        value: point[p],
      });
    });
  });

  return referenceSeries;
};

/**
 * Builds the growth chart series for a patient: the WHO reference percentiles for the patient's gender
 * followed by the patient's own weight measurements. The reference data is loaded lazily and cached.
 *
 * Returns an empty series if the patient has no valid birth date.
 */
export function useChartData(patient: fhir.Patient, weights: Array<Observation>) {
  const { t } = useTranslation();
  const birthDate = patient.birthDate ? dayjs(patient.birthDate) : null;
  const hasValidBirthDate = Boolean(birthDate?.isValid());
  const gender = patient.gender?.toLowerCase();

  const {
    data: referenceSeries,
    error,
    isLoading,
  } = useSWRImmutable<Array<ChartDatum>, Error>(
    hasValidBirthDate ? ['growthChartReferenceSeries', gender] : null,
    ([, gender]: [string, string | undefined]) => getReferenceSeries(gender),
  );

  const patientWeightLabel = t('patientWeight', 'Patient weight');
  const birthDateValue = birthDate?.valueOf();

  const data = useMemo(() => {
    if (!hasValidBirthDate || !referenceSeries) {
      return [];
    }

    return [...referenceSeries, ...getPatientSeries(weights, dayjs(birthDateValue), patientWeightLabel)];
  }, [hasValidBirthDate, referenceSeries, weights, birthDateValue, patientWeightLabel]);

  return {
    data,
    isLoading,
    error,
  };
}
