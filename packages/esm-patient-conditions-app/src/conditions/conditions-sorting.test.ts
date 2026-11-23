import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { type DataTableSortState } from '@carbon/react';
import { type ConditionTableHeader, getOnsetSortValue, useConditionsSorting } from './conditions.resource';

interface Row {
  id: string;
  display: string;
  onsetDateTime?: string;
  status: string;
}

const headers: Array<ConditionTableHeader<Row>> = [
  { key: 'display', header: 'Condition', isSortable: true, sortValue: (row) => row.display },
  {
    key: 'onsetDateTimeRender',
    header: 'Date of onset',
    isSortable: true,
    sortValue: (row) => getOnsetSortValue(row.onsetDateTime),
  },
  { key: 'status', header: 'Status', isSortable: true, sortValue: (row) => row.status },
];

// Rows without an onset date are placed first and in the middle on purpose, so a
// comparator that treats a missing date as "equal" would leave them out of place.
const rows: Array<Row> = [
  { id: '1', display: 'Malaria', status: 'active' },
  { id: '2', display: 'Asthma', onsetDateTime: '2024-06-10T00:00:00+00:00', status: 'inactive' },
  { id: '3', display: 'Hypertension', status: 'active' },
  { id: '4', display: 'Diabetes', onsetDateTime: '2020-03-15T00:00:00+00:00', status: 'active' },
  { id: '5', display: 'Cough', onsetDateTime: '2022-01-01T00:00:00+00:00', status: 'inactive' },
];

function renderSorting() {
  const { result } = renderHook(() => useConditionsSorting(headers, rows));

  const sortBy = (sortHeaderKey: string, sortDirection: DataTableSortState) =>
    act(() => result.current.handleSortHeaderClick(undefined, { sortHeaderKey, sortDirection }));

  const ids = () => result.current.sortedRows.map((row) => row.id);

  return { sortBy, ids };
}

describe('useConditionsSorting', () => {
  it('keeps the original order until a header is sorted', () => {
    const { ids } = renderSorting();

    expect(ids()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('sorts the condition name A to Z when ascending and Z to A when descending', () => {
    const { sortBy, ids } = renderSorting();

    sortBy('display', 'ASC');
    expect(ids()).toEqual(['2', '5', '4', '3', '1']);

    sortBy('display', 'DESC');
    expect(ids()).toEqual(['1', '3', '4', '5', '2']);
  });

  it('sorts onset dates oldest first when ascending and newest first when descending', () => {
    const { sortBy, ids } = renderSorting();

    sortBy('onsetDateTimeRender', 'ASC');
    expect(ids().slice(0, 3)).toEqual(['4', '5', '2']);

    sortBy('onsetDateTimeRender', 'DESC');
    expect(ids().slice(0, 3)).toEqual(['2', '5', '4']);
  });

  it('keeps conditions without an onset date at the bottom in both directions', () => {
    const { sortBy, ids } = renderSorting();

    sortBy('onsetDateTimeRender', 'ASC');
    expect(ids().slice(3)).toEqual(expect.arrayContaining(['1', '3']));
    expect(ids().slice(3)).toHaveLength(2);

    sortBy('onsetDateTimeRender', 'DESC');
    expect(ids().slice(3)).toEqual(expect.arrayContaining(['1', '3']));
    expect(ids().slice(3)).toHaveLength(2);
  });

  it('sorts the status column in the direction requested', () => {
    const { sortBy, ids } = renderSorting();

    sortBy('status', 'ASC');
    expect(ids().slice(0, 3)).toEqual(expect.arrayContaining(['1', '3', '4']));

    sortBy('status', 'DESC');
    expect(ids().slice(0, 2)).toEqual(expect.arrayContaining(['2', '5']));
  });

  it('restores the original order when the header returns to unsorted', () => {
    const { sortBy, ids } = renderSorting();

    sortBy('display', 'ASC');
    sortBy('display', 'NONE');

    expect(ids()).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('getOnsetSortValue', () => {
  it('returns null for a missing or unparseable onset date', () => {
    expect(getOnsetSortValue(undefined)).toBeNull();
    expect(getOnsetSortValue('')).toBeNull();
    expect(getOnsetSortValue('not a date')).toBeNull();
  });

  it('returns a timestamp for a valid onset date', () => {
    expect(getOnsetSortValue('2020-03-15T00:00:00+00:00')).toBe(Date.parse('2020-03-15T00:00:00+00:00'));
  });
});
