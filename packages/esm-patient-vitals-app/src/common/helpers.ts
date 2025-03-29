import { type OpenmrsResource } from '@openmrs/esm-framework';
import { type ConceptMetadata } from '../common';
import { type VitalsBiometricsFormData } from '../vitals-biometrics-form/schema';
import { type VitalsAndBiometricsFieldValuesMap } from './data.resource';
import type { ObsReferenceRanges, ObservationInterpretation } from './types';

export function calculateBodyMassIndex(weight: number, height: number) {
  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
  return null;
}

export function assessValue(value: number | undefined, range?: ObsReferenceRanges): ObservationInterpretation {
  if (range && value) {
    if (range.hiCritical && value >= range.hiCritical) {
      return 'critically_high';
    }

    if (range.hiNormal && value > range.hiNormal) {
      return 'high';
    }

    if (range.lowCritical && value <= range.lowCritical) {
      return 'critically_low';
    }

    if (range.lowNormal && value < range.lowNormal) {
      return 'low';
    }
  }

  return 'normal';
}

export function interpretBloodPressure(
  systolic: number | undefined,
  diastolic: number | undefined,
  concepts: { systolicBloodPressureUuid?: string; diastolicBloodPressureUuid?: string } | undefined,
  conceptMetadata: Array<ConceptMetadata> | undefined,
): ObservationInterpretation {
  if (!conceptMetadata) {
    return 'normal';
  }

  const systolicAssessment = assessValue(
    systolic,
    getReferenceRangesForConcept(concepts?.systolicBloodPressureUuid, conceptMetadata),
  );

  const diastolicAssessment = concepts?.diastolicBloodPressureUuid
    ? assessValue(diastolic, getReferenceRangesForConcept(concepts.diastolicBloodPressureUuid, conceptMetadata))
    : 'normal';

  if (systolicAssessment === 'critically_high' || diastolicAssessment === 'critically_high') {
    return 'critically_high';
  }

  if (systolicAssessment === 'critically_low' || diastolicAssessment === 'critically_low') {
    return 'critically_low';
  }

  if (systolicAssessment === 'high' || diastolicAssessment === 'high') {
    return 'high';
  }

  if (systolicAssessment === 'low' || diastolicAssessment === 'low') {
    return 'low';
  }

  return 'normal';
}

export function generatePlaceholder(value: string) {
  switch (value) {
    case 'BMI':
      return '';

    case 'Temperature':
    case 'Weight':
      return '--.-';

    case 'Height':
    case 'diastolic':
    case 'systolic':
    case 'Pulse':
      return '---';

    default:
      return '--';
  }
}

export function getReferenceRangesForConcept(
  conceptUuid: string | undefined | null,
  conceptMetadata: Array<ConceptMetadata> | undefined,
): ConceptMetadata | undefined {
  if (!conceptUuid || !conceptMetadata?.length) {
    return undefined;
  }

  return conceptMetadata?.find((metadata) => metadata.uuid === conceptUuid);
}

export function prepareObsForSubmission(
  formData: VitalsBiometricsFormData,
  dirtyFields: Record<string, boolean>,
  formContext: 'creating' | 'editing',
  initialFieldValuesMap: VitalsAndBiometricsFieldValuesMap,
  fieldToConceptMap: Record<string, string>,
): {
  toBeVoided: Array<OpenmrsResource>;
  newObs: Array<OpenmrsResource>;
} {
  return Object.entries(formData).reduce(
    (obsForSubmission, [field, newValue]) => {
      if (!fieldToConceptMap[`${field}Uuid`]) {
        console.error(`Missing concept mapping for field: ${field}`);
        return obsForSubmission;
      }
      if (formContext === 'editing' && initialFieldValuesMap.has(field) && dirtyFields[field]) {
        // void old obs
        const { obs } = initialFieldValuesMap.get(field);
        obsForSubmission.toBeVoided.push({
          uuid: obs.uuid,
          voided: true,
        });

        if (newValue) {
          obsForSubmission.newObs.push({
            concept: fieldToConceptMap[`${field}Uuid`],
            value: newValue,
          });
        }
      } else if (dirtyFields[field] && newValue) {
        // create new obs
        obsForSubmission.newObs.push({
          concept: fieldToConceptMap[`${field}Uuid`],
          value: newValue,
        });
      }

      return obsForSubmission;
    },
    {
      toBeVoided: [],
      newObs: [],
    },
  );
}
