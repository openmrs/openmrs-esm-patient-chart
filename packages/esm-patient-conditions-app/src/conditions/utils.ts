import { parseDate } from '@openmrs/esm-framework';
/**
 * Enables a comparison of arbitrary values with support for undefined/null.
 * Requires the `<` and `>` operators to return something reasonable for the provided values.
 */
export function compare<T extends string>(x?: T, y?: T) {
  if (x === y || (!x && !y)) {
    return 0;
  } else if (!x) {
    return -1;
  } else if (!y) {
    return 1;
  } else {
    const xDate = parseDate(x);
    const yDate = parseDate(y);

    if (xDate === yDate) {
      return 0;
    }

    return xDate < yDate ? -1 : 1;
  }
}
