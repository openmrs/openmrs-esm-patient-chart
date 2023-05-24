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

//convert age into an integer (whole number)
export function extractNumbers(str) {
  const regex = /\d+/g;
  const match = str.match(regex);
  if (!match) {
    return null;
  }
  return parseInt(match[0], 10);
}

export function getColorCode(age, muac, setColorcode) {
  let color = '';
  switch (true) {
    // children 5 years and below with a muac equal to 14
    case age <= 5 && muac <= 11.5 && muac > 0:
      setColorcode('red');
      break;
    case age < 5 && muac > 11.5 && muac < 12.5:
      setColorcode('yellow');
      break;
    case age < 5 && muac > 12.5:
      setColorcode('green');
      break;
    // above 5 but less than 10
    case age > 5 && age < 10 && muac <= 13.5 && muac > 0:
      setColorcode('red');
      break;
    case age > 5 && age < 10 && muac > 13.5 && muac < 14.5:
      setColorcode('yellow');
      break;
    case age > 5 && age < 10 && muac > 14.5:
      setColorcode('green');
      break;
    //above 10 but less than 18
    case age > 10 && age < 18 && muac <= 16.5 && muac > 0:
      setColorcode('red');
      break;
    case age > 10 && age < 18 && muac > 16.5 && muac < 19.0:
      setColorcode('yellow');
      break;
    case age > 10 && age < 18 && muac > 19.0:
      setColorcode('green');
      break;
    // above 18
    case age > 18 && muac <= 19.5 && muac > 0:
      setColorcode('red');
      break;
    case age > 18 && muac > 19.0 && muac < 22.0:
      setColorcode('yellow');
      break;
    case age > 18 && muac > 22.0:
      setColorcode('green');
      break;
  }
  return color;
}
