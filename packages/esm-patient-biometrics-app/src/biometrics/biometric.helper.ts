import dayjs from 'dayjs';

const FEET: number = 0.0328084;
const INCH: number = 12;

export function calculateBMI(weight: number, height: number) {
  if (weight > 0 && height > 0) {
    return (weight / (height / 100) ** 2).toFixed(1);
  }
  return null;
}

export function formatDate(strDate: string) {
  const date = dayjs(strDate);
  const today = dayjs(new Date());
  if (date.date() === today.date() && date.month() === today.month() && date.year() === today.year()) {
    return `Today ${date.format('hh:mm A')}`;
  } else if (date.year() === today.year()) {
    return date.format('DD-MMM hh:mm A');
  } else {
    return date.format('YYYY DD-MMM');
  }
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

export function customDateFormat(date: any, dateFormat: string) {
  return dayjs(date).format(dateFormat);
}
