import dayjs from 'dayjs';
import { type OpenmrsResource } from '@openmrs/esm-framework';
import { type DurationInput } from '@formatjs/intl-durationformat/src/types';
import { type ConceptMetadata } from '../common';
import type { FHIRInterpretation, ObsReferenceRanges, ObservationInterpretation } from './types';
import { type VitalsBiometricsFormData } from '../vitals-biometrics-form/schema';
import { type VitalsAndBiometricsFieldValuesMap } from './data.resource';
import { type BiometricsConfigObject } from '../config-schema';

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

export function mapFhirInterpretationToObservationInterpretation(
  interpretation: FHIRInterpretation,
): ObservationInterpretation {
  const normalized = interpretation?.trim();
  switch (normalized) {
    case 'Critically Low':
      return 'critically_low';
    case 'Critically High':
      return 'critically_high';
    case 'High':
      return 'high';
    case 'Low':
      return 'low';
    case 'Normal':
      return 'normal';
    default:
      return 'normal';
  }
}

export function interpretBloodPressure(
  systolic: number | undefined,
  diastolic: number | undefined,
  concepts: { systolicBloodPressureUuid?: string; diastolicBloodPressureUuid?: string } | undefined,
  conceptMetadata: Array<ConceptMetadata> | undefined,
  systolicInterpretation?: ObservationInterpretation,
  diastolicInterpretation?: ObservationInterpretation,
): ObservationInterpretation {
  if (!conceptMetadata) {
    return 'normal';
  }

  // Use interpretation from FHIR Observation when available (preferred).
  // Fallback to calculation for backward compatibility: existing observations may not have
  // interpretation set if they were created before interpretation was added, or if reference
  // ranges weren't available at creation time.
  const systolicAssessment =
    systolicInterpretation ??
    (concepts?.systolicBloodPressureUuid
      ? assessValue(systolic, getReferenceRangesForConcept(concepts.systolicBloodPressureUuid, conceptMetadata))
      : 'normal');

  const diastolicAssessment =
    diastolicInterpretation ??
    (concepts?.diastolicBloodPressureUuid
      ? assessValue(diastolic, getReferenceRangesForConcept(concepts.diastolicBloodPressureUuid, conceptMetadata))
      : 'normal');

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

/**
 * Calculates the duration between a birthDate and a reference date.
 * Mimics the internal logic of the OpenMRS age() utility but returns
 * a structured DurationInput object.
 */
export function getDurationSince(
  birthDate: dayjs.ConfigType,
  currentDate: dayjs.ConfigType = dayjs(),
): DurationInput | null {
  if (!birthDate) {
    return null;
  }

  const to = dayjs(currentDate);
  const from = dayjs(birthDate);

  if (!from.isValid()) {
    return null;
  }

  const yearDiff = to.diff(from, 'years');
  const monthDiff = to.diff(from, 'months');
  const weekDiff = to.diff(from, 'weeks');
  const dayDiff = to.diff(from, 'days');
  const hourDiff = to.diff(from, 'hours');

  const duration: DurationInput = {};

  if (hourDiff < 2) {
    duration['minutes'] = to.diff(from, 'minutes');
  } else if (dayDiff < 2) {
    duration['hours'] = hourDiff;
  } else if (weekDiff < 4) {
    duration['days'] = dayDiff;
  } else if (yearDiff < 1) {
    duration['weeks'] = weekDiff;
    duration['days'] = to.subtract(weekDiff, 'weeks').diff(from, 'days');
  } else if (yearDiff < 2) {
    duration['months'] = monthDiff;
    duration['days'] = to.subtract(monthDiff, 'months').diff(from, 'days');
  } else if (yearDiff < 18) {
    duration['years'] = yearDiff;
    duration['months'] = to.subtract(yearDiff, 'years').diff(from, 'months');
  } else {
    duration['years'] = yearDiff;
  }

  return duration;
}

/**
 * Uses the patient's birthDate to calculate their age in years.
 * Returns null if birthDate is missing or invalid.
 */
export const getPatientAge = (patient: fhir.Patient): number | null => {
  const duration = getDurationSince(patient.birthDate);

  return duration ? duration.years ?? 0 : null;
};

/**
 * Determines whether BMI should be shown for the given patient,
 * based on the biometrics configuration and patient's age.
 */
export const shouldShowBmi = (patient: fhir.Patient, biometricsConfig: BiometricsConfigObject): boolean => {
  const minAge = biometricsConfig.bmiMinimumAge ?? 0;

  // If the minimum age is 0 or less, we always show BMI (No restriction)
  if (minAge <= 0) {
    return true;
  }

  const patientAge = getPatientAge(patient);

  // Fallback: If birthDate is missing/invalid, show BMI to be safe
  if (patientAge === null) {
    return true;
  }

  return patientAge >= minAge;
};
