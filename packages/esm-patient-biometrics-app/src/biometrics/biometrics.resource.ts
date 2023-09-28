import useSwrInfinite from 'swr/infinite';
import { fhirBaseUrl, FHIRResource, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBodyMassIndex } from './biometrics-helpers';
import { useCallback, useMemo } from 'react';

interface BiometricsFetchResponse {
  id: string;
  entry: Array<{
    resource: FHIRResource['resource'];
  }>;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  resourceType: string;
  total: number;
  type: string;
}

export interface PatientBiometrics {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  bmi?: number;
  muac?: number;
}

type MappedBiometrics = {
  code: string;
  recordedDate: Date;
  value: number;
};

export const pageSize = 100;

export function useBiometrics(patientUuid: string, concepts: Record<string, string>) {
  const getUrl = useCallback(
    (page, prevPageData) => {
      if (prevPageData && !prevPageData?.data?.link.some((link) => link.relation === 'next')) {
        return null;
      }

      let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&`;
      let urlSearchParams = new URLSearchParams();

      urlSearchParams.append('code', Object.values(concepts).join(','));
      urlSearchParams.append('_summary', 'data');
      urlSearchParams.append('_sort', '-date');
      urlSearchParams.append('_count', pageSize.toString());

      if (page) {
        urlSearchParams.append('_getpagesoffset', (page * pageSize).toString());
      }

      return url + urlSearchParams.toString();
    },
    [concepts, patientUuid],
  );

  const { data, isValidating, setSize, error, size, mutate } = useSwrInfinite<{ data: BiometricsFetchResponse }, Error>(
    getUrl,
    openmrsFetch,
  );

  const getBiometricValueKey = (conceptUuid: string): string => {
    switch (conceptUuid) {
      case concepts.heightUuid:
        return 'height';
      case concepts.weightUuid:
        return 'weight';
      case concepts.muacUuid:
        return 'muac';
    }
  };

  const mapBiometricsProperties = (resource: FHIRResource['resource']): MappedBiometrics => ({
    code: resource?.code?.coding?.[0]?.code,
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  });

  const biometricsHashTable = new Map<string, Partial<PatientBiometrics>>([]);
  const biometricsResponse = data?.[0]?.data?.entry?.map((entry) => entry.resource ?? []).map(mapBiometricsProperties);

  biometricsResponse?.map((biometrics) => {
    const recordedDate = new Date(new Date(biometrics.recordedDate)).toISOString();

    if (biometricsHashTable.has(recordedDate)) {
      biometricsHashTable.set(recordedDate, {
        ...biometricsHashTable.get(recordedDate),
        [getBiometricValueKey(biometrics.code)]: biometrics.value,
      });
    } else {
      biometrics.value &&
        biometricsHashTable.set(recordedDate, {
          [getBiometricValueKey(biometrics.code)]: biometrics.value,
        });
    }
  });

  const formattedBiometrics: Array<PatientBiometrics> = Array.from(biometricsHashTable).map(
    ([date, biometrics], index) => {
      return {
        ...biometrics,
        id: index.toString(),
        bmi: calculateBodyMassIndex(Number(biometrics.weight), Number(biometrics.height)),
        date: date,
      };
    },
  );

  const results = useMemo(
    () => ({
      biometrics: data ? [].concat(formattedBiometrics) : null,
      isLoading: !data && !error,
      isError: error,
      hasMore: data?.length ? !!data?.[data?.length - 1].data?.link?.some((link) => link.relation === 'next') : false,
      isValidating,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.total ?? null,
      mutate,
    }),
    [data, isValidating, error, setSize, size, formattedBiometrics, mutate],
  );

  return results;
}
