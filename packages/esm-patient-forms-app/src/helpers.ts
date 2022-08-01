/**
 * A function that takes an array and groups with a given property
 * @param arrayToTransform The Array to transform
 * @param property element to use while grouping items
 * @returns Array of transform object
 */
export function groupBy<T>(arrayToTransform, property): Array<T> {
  return arrayToTransform?.reduce(function (accumulator, item) {
    const key = item[property];
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator as Array<T>;
  }, {});
}
