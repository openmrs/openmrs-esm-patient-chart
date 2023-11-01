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
