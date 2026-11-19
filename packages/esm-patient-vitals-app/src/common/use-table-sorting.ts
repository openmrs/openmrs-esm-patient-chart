import { useCallback, useMemo, useState } from 'react';
import { type DataTableSortState } from '@carbon/react';

export type SortValue = number | null | undefined;

interface SortableTableHeader<TableRow> {
  key: string;
  /**
   * The values a row is sorted by, compared in order, so that later values break
   * ties between earlier ones (e.g. `[systolic, diastolic]`).
   */
  sortValues: (row: TableRow) => Array<SortValue>;
}

/**
 * Compares two rows' sort values in the given direction. A missing value always sorts
 * after a present one, whichever the direction, so readings that weren't recorded
 * stay at the bottom of the table instead of breaking up the sorted ones.
 */
function compareSortValues(valuesA: Array<SortValue>, valuesB: Array<SortValue>, direction: 1 | -1) {
  for (let i = 0; i < Math.max(valuesA.length, valuesB.length); i++) {
    const a = valuesA[i];
    const b = valuesB[i];
    const isMissingA = a == null;
    const isMissingB = b == null;

    if (isMissingA !== isMissingB) {
      return isMissingA ? 1 : -1;
    }

    if (!isMissingA && a !== b) {
      return (a - b) * direction;
    }
  }

  return 0;
}

/**
 * Keeps Carbon's comparator inert so that `useTableSorting` sorts the full dataset
 * and Carbon does not sort the rows again. Pass this as the table's `sortRow`.
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

    const direction = sortParams.sortDirection === 'DESC' ? -1 : 1;
    return tableRows
      .slice()
      .sort((rowA, rowB) => compareSortValues(header.sortValues(rowA), header.sortValues(rowB), direction));
  }, [tableHeaders, tableRows, sortParams]);

  return { handleSortHeaderClick, sortedData };
}
