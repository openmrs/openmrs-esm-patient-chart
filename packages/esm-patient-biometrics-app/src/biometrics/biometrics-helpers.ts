import dayjs from 'dayjs';

const FEET: number = 0.0328084;
const INCH: number = 12;

export function calculateBMI(weight: number, height: number) {
  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
  return null;
}

export function convertToPounds(kiloGrams: number) {
  return (kiloGrams * 2.205).toFixed(2);
}

export function convertToFeet(centiMeters: number) {
  return Math.floor(FEET * centiMeters);
}

export function convertoToInches(centiMeters: number) {
  return (INCH * (FEET * centiMeters - Math.floor(FEET * centiMeters))).toFixed(2);
}
