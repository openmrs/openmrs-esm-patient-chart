/**
 * Enables a comparison of arbitrary values with support for undefined/null.
 * Requires the `<` and `>` operators to return something reasonable for the provided values.
 *
 * Undefined/null values are sorted to the FRONT (treated as less than any defined value).
 * This matches the clinical convention where missing data is shown first to alert clinicians
 * that a reading has not been recorded rather than hiding it at the bottom.
 *
 * @example
 * // Sort vitals with missing values first
 * vitals.sort((a, b) => compare(a.systolic, b.systolic));
 */
export function compare<T>(x?: T, y?: T): -1 | 0 | 1 {
  if (x == undefined && y == undefined) {
    return 0;
  } else if (x == undefined) {
    return -1;
  } else if (y == undefined) {
    return 1;
  } else if (x < y) {
    return -1;
  } else if (x > y) {
    return 1;
  } else {
    return 0;
  }
}
