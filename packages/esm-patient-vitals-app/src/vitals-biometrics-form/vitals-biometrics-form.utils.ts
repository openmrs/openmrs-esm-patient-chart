import isNumber from 'lodash/isNumber';
import { type ConceptMetadata } from '../common';

export function calculateBodyMassIndex(
  weight: number,
  height: number,
  weightUnit: 'lb' | 'lbs' | 'g',
  heightUnit: 'm' | 'cm' | 'in',
): number {
  if (!weight || !height) return;

  if (weight > 0 && height > 0) {
    if (weightUnit === 'lb' || weightUnit === 'lbs') {
      weight = weight * 0.45359237;
    }
    if (weightUnit === 'g') {
      weight = weight / 1000;
    }
    if (heightUnit === 'cm') {
      height = height / 100;
    }
    if (heightUnit === 'in') {
      height = height * 0.0254;
    }
    return Number((weight / height ** 2).toFixed(1));
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
  // Age brackets and MUAC cut-offs follow the Uganda Ministry of Health IMAM Guidelines
  // (Jan 2016), Table 2: Summary of Classification of Acute Malnutrition.
  // https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/UGA-CH-38-03-GUIDELINE-2016-eng-IMAM-Guidelines-for-Uganda-Jan-2016.pdf
  // `age` is the whole number of years extracted from the patient's birth date, so the
  // lower bound of each bracket is inclusive (e.g. a patient turning exactly 5 falls
  // into the "5 to <10 years" bracket per the guideline, not the "6-59 months" bracket).
  switch (true) {
    // 6-59 months (approximated here as under 5 whole years)
    case age < 5 && muac <= 11.5 && muac > 0:
      setColorCode('red');
      break;
    case age < 5 && muac > 11.5 && muac < 12.5:
      setColorCode('yellow');
      break;
    case age < 5 && muac >= 12.5:
      setColorCode('green');
      break;
    // 5 to <10 years
    case age >= 5 && age < 10 && muac <= 13.5 && muac > 0:
      setColorCode('red');
      break;
    case age >= 5 && age < 10 && muac > 13.5 && muac < 14.5:
      setColorCode('yellow');
      break;
    case age >= 5 && age < 10 && muac >= 14.5:
      setColorCode('green');
      break;
    // 10 to <15 years
    case age >= 10 && age < 15 && muac <= 16.0 && muac > 0:
      setColorCode('red');
      break;
    case age >= 10 && age < 15 && muac > 16.0 && muac < 18.5:
      setColorCode('yellow');
      break;
    case age >= 10 && age < 15 && muac >= 18.5:
      setColorCode('green');
      break;
    // 15 to <18 years
    case age >= 15 && age < 18 && muac <= 18.5 && muac > 0:
      setColorCode('red');
      break;
    case age >= 15 && age < 18 && muac > 18.5 && muac < 21.0:
      setColorCode('yellow');
      break;
    case age >= 15 && age < 18 && muac >= 21.0:
      setColorCode('green');
      break;
    // 18 years and above (adults)
    case age >= 18 && muac <= 19.0 && muac > 0:
      setColorCode('red');
      break;
    case age >= 18 && muac > 19.0 && muac < 22.0:
      setColorCode('yellow');
      break;
    case age >= 18 && muac >= 22.0:
      setColorCode('green');
      break;
  }
}
