import useSWR from 'swr';
import { fhirBaseUrl, FHIRResource, openmrsFetch } from '@openmrs/esm-framework';
import { calculateBMI } from './biometrics-helpers';

export const pageSize = 100;

export function useBiometrics(patientUuid: string, concepts: Record<string, string>) {
  const { data, error, isValidating } = useSWR<{ data: BiometricsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      Object.values(concepts).join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
    `,
    openmrsFetch,
  );

  const getBiometricSignKey = (conceptUuid: string) => {
    if (conceptUuid === concepts.heightUuid) return 'height';
    if (conceptUuid === concepts.weightUuid) return 'weight';
    if (conceptUuid === concepts.muacUuid) return 'muac';
    return;
  };

  const formattedBiometrics = () => {
    const biometricsHashTable = new Map<string, Partial<PatientBiometrics>>([]);
    data?.data?.entry?.map(({ resource }) => {
      const issuedDate = new Date(new Date(resource.issued).setSeconds(0, 0)).toISOString();
      if (biometricsHashTable.has(issuedDate)) {
        biometricsHashTable.set(issuedDate, {
          ...biometricsHashTable.get(issuedDate),
          [getBiometricSignKey(resource.code.coding[0].code)]: resource?.valueQuantity?.value,
        });
      } else {
        resource?.valueQuantity?.value &&
          biometricsHashTable.set(issuedDate, {
            [getBiometricSignKey(resource.code.coding[0].code)]: resource?.valueQuantity?.value,
          });
      }
    });

    return Array.from(biometricsHashTable).map(([date, biometric], index) => {
      return {
        ...biometric,
        date: date,
        id: index.toString(),
        bmi: calculateBMI(biometric.weight, biometric.height),
      };
    });
  };

  return {
    biometrics: (formattedBiometrics() as Array<PatientBiometrics>) ?? null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
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
