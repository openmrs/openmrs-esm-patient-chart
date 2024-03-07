import isNumber from 'lodash/isNumber';
import { type ConceptMetadata } from '../common';

export function calculateBodyMassIndex(weight: number, height: number): number {
  if (!weight || !height) return;

  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
}

export function isValueWithinReferenceRange(
  conceptMetadata: Array<ConceptMetadata>,
  conceptUuid: string,
  value: string | number,
) {
  const concept = conceptMetadata?.find((c) => c.uuid === conceptUuid);

  if (value === undefined || value === '' || concept === undefined) {
    return true;
  }

  return isNumber(concept?.lowAbsolute) && isNumber(concept?.hiAbsolute)
    ? Number(value) >= Number(concept.lowAbsolute) && Number(value) <= Number(concept.hiAbsolute)
    : true;
}

// Convert age into an integer (whole number)
export function extractNumbers(str: string) {
  const regex = /\d+/g;
  const match = str.match(regex);
  if (!match) {
    return null;
  }
  return parseInt(match[0], 10);
}

export function getMuacColorCode(age: number, muac: number, setColorCode: (color) => void) {
  switch (true) {
    // children 5 years and below with a muac equal to 14
    case age <= 5 && muac <= 11.5 && muac > 0:
      setColorCode('red');
      break;
    case age < 5 && muac > 11.5 && muac < 12.5:
      setColorCode('yellow');
      break;
    case age < 5 && muac > 12.5:
      setColorCode('green');
      break;
    // above 5 but less than 10
    case age > 5 && age < 10 && muac <= 13.5 && muac > 0:
      setColorCode('red');
      break;
    case age > 5 && age < 10 && muac > 13.5 && muac < 14.5:
      setColorCode('yellow');
      break;
    case age > 5 && age < 10 && muac > 14.5:
      setColorCode('green');
      break;
    //above 10 but less than 18
    case age > 10 && age < 18 && muac <= 16.5 && muac > 0:
      setColorCode('red');
      break;
    case age > 10 && age < 18 && muac > 16.5 && muac < 19.0:
      setColorCode('yellow');
      break;
    case age > 10 && age < 18 && muac > 19.0:
      setColorCode('green');
      break;
    // above 18
    case age > 18 && muac <= 19.5 && muac > 0:
      setColorCode('red');
      break;
    case age > 18 && muac > 19.0 && muac < 22.0:
      setColorCode('yellow');
      break;
    case age > 18 && muac > 22.0:
      setColorCode('green');
      break;
  }
}
