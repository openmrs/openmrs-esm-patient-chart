import useSWR from 'swr';
import { FetchResponse, fhirBaseUrl, FHIRResource, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBMI } from './biometrics-helpers';
import { useCallback, useMemo } from 'react';
import useSwrInfinite from 'swr/infinite';

interface BiometricsFetchResponse {
  id: string;
  entry: Array<FHIRResource>;
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
      let url =
        `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
        Object.values(concepts).join(',') +
        '&_summary=data&_sort=-date' +
        `&_count=${pageSize}
    `;
      if (page) {
        url += `&_getpagesoffset=${page * pageSize}`;
      }
      return url;
    },
    [pageSize],
  );

  const { data, isValidating, setSize, error, size } = useSwrInfinite<
    FetchResponse<{
      link: any;
      entry: any;
      results: Array<BiometricsFetchResponse>;
      links: Array<{ relation: 'prev' | 'next' }>;
      total: number;
    }>,
    Error
  >(getUrl, openmrsFetch);
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
    recordedDate: resource?.issued,
    value: resource?.valueQuantity?.value,
  });
  const biometricsHashTable = new Map<string, Partial<PatientBiometrics>>([]);
  const biometricsResponse = data?.[0]?.data?.entry?.map((entry) => entry.resource ?? []).map(mapBiometricsProperties);

  biometricsResponse?.map((biometrics) => {
    const issuedDate = new Date(new Date(biometrics.recordedDate).setSeconds(0, 0)).toISOString();

    if (biometricsHashTable.has(issuedDate)) {
      biometricsHashTable.set(issuedDate, {
        ...biometricsHashTable.get(issuedDate),
        [getBiometricValueKey(biometrics.code)]: biometrics.value,
      });
    } else {
      biometrics.value &&
        biometricsHashTable.set(issuedDate, {
          [getBiometricValueKey(biometrics.code)]: biometrics.value,
        });
    }
  });

  const formattedBiometrics: Array<PatientBiometrics> = Array.from(biometricsHashTable).map(
    ([date, biometrics], index) => {
      return {
        ...biometrics,
        id: index.toString(),
        bmi: calculateBMI(Number(biometrics.weight), Number(biometrics.height)),
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
    }),
    [data, isValidating, error, setSize, size],
  );
  return results;
}
