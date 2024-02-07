export function orderPriorityToColor(priority) {
  switch (priority) {
    case 'URGENT':
      return '#FCD6D9';
    case 'ROUTINE':
      return '#A7EFBB';
    default:
      return 'grey';
  }
}

export function orderStatusColor(status) {
  switch (status) {
    case 'RECEIVED':
      return '#e8daff';
    case 'IN_PROGRESS':
      return '#defbe6';
    case 'ON_HOLD':
      return '#fff8e1';
    case 'EXCEPTION':
      return '#d0e2ff';
    case 'COMPLETED':
      return '#a7f0ba';
    case 'DISCONTINUED':
      return '#ffd7d9';
    case 'DECLINED':
      return '#ffd7d9';
    default:
      return '#dde1e6';
  }
}

/**
 * Enables a comparison of arbitrary values with support for undefined/null.
 * Requires the `<` and `>` operators to return something reasonable for the provided values.
 */
export function compare<T>(x?: T, y?: T) {
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
