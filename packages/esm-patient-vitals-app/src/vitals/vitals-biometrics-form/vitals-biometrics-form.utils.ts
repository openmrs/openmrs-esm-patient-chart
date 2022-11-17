import inRange from 'lodash/inRange';
import isNumber from 'lodash/isNumber';
import { ConceptMetadata } from '@openmrs/esm-patient-common-lib';

export function calculateBMI(weight: number, height: number): number {
  if (!weight || !height) return;

  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
}

export function isInNormalRange(conceptMetadata: Array<ConceptMetadata>, conceptUuid: string, value: string | number) {
  if (value === undefined || value === '') {
    return true;
  }

  const concept = conceptMetadata.find((c) => c.uuid === conceptUuid);
  return isNumber(concept?.lowAbsolute) && isNumber(concept?.hiAbsolute)
    ? Number(value) >= Number(concept.lowAbsolute) && Number(value) <= Number(concept.hiAbsolute)
    : true;
}
