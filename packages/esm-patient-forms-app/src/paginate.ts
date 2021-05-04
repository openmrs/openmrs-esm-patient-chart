import chunk from "lodash-es/chunk";

/**
 * Paginates the specified array into a set of pages and returns the page with the specified page number.
 * @param items The items to be paged.
 * @param pageNumber The number of the page to be returned as the first result element. Not zero-based!
 *                   The first page has the number 1.
 * @param itemsPerPage The number of items per page.
 */
function paginate<T>(
  items: Array<T>,
  pageNumber: number,
  itemsPerPage: number
): [Array<T>, Array<Array<T>>] {
  const allPages = chunk(items, itemsPerPage);
  const page = allPages[pageNumber - 1] ?? [];
  return [page, allPages];
}

export default paginate;
