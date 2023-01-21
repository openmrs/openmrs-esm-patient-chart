import useSWR from 'swr';
import { fhirBaseUrl, FHIRResource, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBMI } from './biometrics-helpers';

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
  issued: Date;
  value: number;
};

export const pageSize = 100;

export function useBiometrics(patientUuid: string, concepts: Record<string, string>) {
  const apiUrl =
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
    Object.values(concepts).join(',') +
    '&_summary=data&_sort=-date' +
    `&_count=${pageSize}
  `;

  const { data, error, isValidating } = useSWR<{ data: BiometricsFetchResponse }, Error>(apiUrl, openmrsFetch);

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
    issued: resource?.issued,
    value: resource?.valueQuantity?.value,
  });

  const biometricsHashTable = new Map<string, Partial<PatientBiometrics>>([]);
  const biometricsResponse = data?.data?.entry?.map((entry) => entry.resource ?? []).map(mapBiometricsProperties);

  biometricsResponse?.map((biometrics) => {
    const issuedDate = new Date(new Date(biometrics.issued)).toISOString();

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

  return {
    biometrics: formattedBiometrics,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
