import inRange from 'lodash/inRange';
import isNumber from 'lodash/isNumber';
import { ConceptMetaData } from './use-vitalsigns';

export function calculateBMI(weight: number, height: number): number {
  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
}

export function isInNormalRange(conceptsMetaData: Array<ConceptMetaData>, conceptUuid: string, value: string | number) {
  if (value === undefined || value === '') {
    return true;
  }

  const concept = conceptsMetaData.find((c) => c.uuid === conceptUuid);
  return isNumber(concept?.lowNormal) && isNumber(concept?.hiNormal)
    ? inRange(Number(value), Number(concept.lowNormal), Number(concept.hiNormal))
    : true;
}
