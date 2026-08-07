import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { boysWeightReference, girlsWeightReference, type CentilePoint } from './reference-data';

export interface PatientMeasurement {
  x: number; // age in months
  y: number; // value (kg)
  dateStr: string;
}

export function useGrowthChartData(patientUuid: string, conceptUuid: string, birthDate: Date | null) {
  const url = patientUuid
    ? `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${conceptUuid}&_sort=-date&_count=100`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  const measurements: PatientMeasurement[] = [];
  if (data?.data?.entry && birthDate) {
    data.data.entry
      .map((entry: any) => entry.resource)
      .filter((res: any) => res && res.effectiveDateTime && res.valueQuantity?.value !== undefined)
      .forEach((res: any) => {
        const obsDate = new Date(res.effectiveDateTime);
        const diffTime = obsDate.getTime() - birthDate.getTime();
        const ageInMonths = Math.max(0, diffTime / (1000 * 60 * 60 * 24 * 30.4375));
        measurements.push({
          x: Math.round(ageInMonths * 10) / 10,
          y: res.valueQuantity.value,
          dateStr: obsDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        });
      });
    measurements.sort((a, b) => a.x - b.x);
  }

  return {
    measurements,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function getPercentilesForAge(ageInMonths: number, isMale: boolean): { p3: number; p50: number; p97: number } {
  const reference = isMale ? boysWeightReference : girlsWeightReference;

  const lower = reference[0];
  const upper = reference[reference.length - 1];

  if (ageInMonths <= lower.age) return { p3: lower.p3, p50: lower.p50, p97: lower.p97 };
  if (ageInMonths >= upper.age) return { p3: upper.p3, p50: upper.p50, p97: upper.p97 };

  for (let i = 0; i < reference.length - 1; i++) {
    if (ageInMonths >= reference[i].age && ageInMonths <= reference[i + 1].age) {
      const lowerPoint = reference[i];
      const upperPoint = reference[i + 1];
      const ratio = (ageInMonths - lowerPoint.age) / (upperPoint.age - lowerPoint.age);
      return {
        p3: Number((lowerPoint.p3 + ratio * (upperPoint.p3 - lowerPoint.p3)).toFixed(1)),
        p50: Number((lowerPoint.p50 + ratio * (upperPoint.p50 - lowerPoint.p50)).toFixed(1)),
        p97: Number((lowerPoint.p97 + ratio * (upperPoint.p97 - lowerPoint.p97)).toFixed(1)),
      };
    }
  }

  return { p3: lower.p3, p50: lower.p50, p97: lower.p97 };
}
