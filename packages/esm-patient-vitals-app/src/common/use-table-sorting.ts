import { useCallback, useMemo, useState } from 'react';
import { type DataTableSortState } from '@carbon/react';

interface SortableTableHeader<TableRow> {
  key: string;
  sortFunc: (rowA: TableRow, rowB: TableRow) => number;
}

/**
 * Carbon only ever sorts the rows it was handed, which is a single page. Pass this
 * as the table's `sortRow` to keep its comparator inert so that the hook can sort
 * the full dataset instead.
 */
export const noopSortRow = () => 0;

/**
 * Sorts a paginated table's full dataset rather than just its visible page.
 *
 * The sort state is read from the header's click handler, which Carbon calls
 * exactly once per click with the state it is transitioning to. `sortRow` is the
 * wrong hook for that: Carbon re-runs it while deriving its own state, skips it
 * when a header transitions to `NONE`, and never invokes it when the page holds a
 * single row, because `Array.prototype.sort` performs no comparisons on a
 * single-element array.
 */
export function useTableSorting<TableRow>(
  tableRows: Array<TableRow>,
  tableHeaders: Array<SortableTableHeader<TableRow>>,
) {
  const [sortParams, setSortParams] = useState<{ key: string; sortDirection: DataTableSortState }>({
    key: '',
    sortDirection: 'NONE',
  });

  const handleSortHeaderClick = useCallback(
    (
      _event: unknown,
      { sortHeaderKey, sortDirection }: { sortHeaderKey: string; sortDirection: DataTableSortState },
    ) => {
      setSortParams({ key: sortDirection === 'NONE' ? '' : sortHeaderKey, sortDirection });
    },
    [],
  );

  const sortedData: Array<TableRow> = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    const header = tableHeaders.find((header) => header.key === sortParams.key);

    if (!header) {
      return tableRows;
    }

    // `sortFunc` compares in ascending order, so it maps directly onto the ASC
    // sort direction and needs inverting for DESC.
    return tableRows.slice().sort((rowA, rowB) => {
      const sortingNum = header.sortFunc(rowA, rowB);
      return sortParams.sortDirection === 'DESC' ? -sortingNum : sortingNum;
    });
  }, [tableHeaders, tableRows, sortParams]);

  return { handleSortHeaderClick, sortedData };
}
