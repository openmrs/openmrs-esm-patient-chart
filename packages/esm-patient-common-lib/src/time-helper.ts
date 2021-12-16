const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
export type amPm = 'AM' | 'PM';

export const convertTime12to24 = (time12h, timeFormat: amPm) => {
  let [hours, minutes] = time12h.split(':');

  if (hours === '12' && timeFormat === 'AM') {
    hours = '00';
  }

  if (timeFormat === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return [hours, minutes];
};

export function toDateWithoutSeconds(date: Date | string) {
  return regex.exec(date.toString())[0];
}
