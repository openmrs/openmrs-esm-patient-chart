export type amPm = 'AM' | 'PM';

/**
 * Validates 12-hour time strings of the format "H:MM" or "HH:MM"
 * (1:00 through 12:59). Does not accept 24-hour or invalid values.
 */
export const time12HourFormatRegex = new RegExp(/^(1[0-2]|0?[1-9]):[0-5][0-9]$/);

/**
 * Converts a 12-hour time string to a [hours, minutes] tuple in 24-hour format.
 *
 * Returns [0, 0] for invalid input so callers always receive a usable value.
 * This matters in visit note forms where clinicians type the time manually
 * and an invalid time should not crash the form.
 *
 * @param time12h - Time string in "H:MM" or "HH:MM" 12-hour format
 * @param timeFormat - "AM" or "PM" period indicator
 * @returns Tuple of [hours (0-23), minutes (0-59)]
 *
 * @example
 * convertTime12to24('2:30', 'PM')  // returns [14, 30]
 * convertTime12to24('12:00', 'AM') // returns [0, 0]  (midnight)
 * convertTime12to24('not-a-time', 'AM') // returns [0, 0] (graceful fallback)
 */
export const convertTime12to24 = (time12h: string, timeFormat: amPm): [number, number] => {
  if (!time12h.match(time12HourFormatRegex)) {
    return [0, 0];
  }

  let [hours, minutes] = time12h.split(':').map((item) => parseInt(item, 10));
  hours = hours % 12;

  if (timeFormat === 'PM') {
    hours += 12;
  }

  return [hours, minutes];
};
