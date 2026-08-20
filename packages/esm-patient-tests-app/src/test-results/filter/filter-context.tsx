import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import { type MappedObservation, type TestResult, type GroupedObservation, type Observation } from '../../types';
import {
  ReducerActionType,
  type FilterContextProps,
  type ObservationData,
  type ReducerState,
  type TimelineData,
  type TreeNode,
} from './filter-types';
import reducer, { mergeObsMultisetMax } from './filter-reducer';

function parseTime(sortedTimes: Array<string>) {
  const yearColumns: Array<{ year: string; size: number }> = [],
    dayColumns: Array<{ year: string; day: string; size: number }> = [],
    timeColumns: string[] = [];

  sortedTimes.forEach((datetime) => {
    const parsedDate = parseDate(datetime);
    const year = parsedDate.getFullYear().toString();
    const date = formatDate(parsedDate, { mode: 'wide', year: false, time: false });
    const time = formatTime(parsedDate);

    const yearColumn = yearColumns.find(({ year: innerYear }) => year === innerYear);
    if (yearColumn) yearColumn.size++;
    else yearColumns.push({ year, size: 1 });

    const dayColumn = dayColumns.find(({ year: innerYear, day: innerDay }) => date === innerDay && year === innerYear);
    if (dayColumn) dayColumn.size++;
    else dayColumns.push({ day: date, year, size: 1 });

    timeColumns.push(time);
  });

  return { yearColumns, dayColumns, timeColumns, sortedTimes };
}

// Derive the key of the panel a test is rendered under from its flatName.
// flatNames look like "Hematology-Complete blood count-Platelets", where the
// panel name sits at index 1; deeper roots like "Bloodwork-Hematology-..."
// therefore resolve to a different key. Used both to group rows and to scope
// de-duplication, so the two stay aligned.
function deriveGroupKey(flatName: string): string {
  const flatNameParts = flatName.split('-');
  return flatNameParts.length >= 2 ? flatNameParts[1] : flatNameParts[0];
}

// A rendered branch: one concept under one rendered panel, after collapsing the
// duplicate branches the obstree backend can return for the same concept (e.g.
// one branch per order placed for a test).
interface NormalizedBranch {
  test: TestResult;
  stateKey: string;
  flatNames: Array<string>;
  obs: Array<ObservationData>;
}

const initialState: ReducerState = {
  checkboxes: {},
  parents: {},
  roots: [{ display: '', flatName: '' }],
  tests: {},
  lowestParents: [],
};

const initialContext = {
  state: initialState,
  ...initialState,
  timelineData: null,
  tableData: null,
  trendlineData: null,
  activeTests: [],
  someChecked: false,
  totalResultsCount: 0,
  filteredResultsCount: 0,
  isLoading: false,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
  resetTree: () => {},
};

const FilterContext = createContext<FilterContextProps>(initialContext);

export type Roots = Array<TreeNode>;

export interface FilterProviderProps {
  roots: Roots;
  isLoading: boolean;
  children: React.ReactNode;
}

const FilterProvider = ({ roots, isLoading, children }: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      initialize: (trees: Array<TreeNode>) => dispatch({ type: ReducerActionType.INITIALIZE, trees: trees }),
      toggleVal: (name: string) => dispatch({ type: ReducerActionType.TOGGLE_CHECKBOX, name: name }),
      updateParent: (name: string) => dispatch({ type: ReducerActionType.TOGGLE_PARENT, name: name }),
      resetTree: () => dispatch({ type: ReducerActionType.RESET_TREE }),
    }),
    [dispatch],
  );

  const activeTests = useMemo(() => {
    return Object.keys(state?.checkboxes)?.filter((key) => state.checkboxes[key]) || [];
  }, [state.checkboxes]);

  const someChecked = Boolean(activeTests.length);

  // Normalize rendered branches by the concept's identity within its rendered
  // panel. The obstree backend can return the same concept under several
  // branches (e.g. one branch per order), each carrying a copy of the same obs
  // list. Duplicate branches within one panel merge their obs with the same
  // multiset-max union the reducer applies to same-flatName duplicates, so
  // copied lists collapse while equal obs within one list survive as distinct
  // results. A concept that legitimately renders under two different panels
  // stays as two branches. tableData, timelineData, and both result counts
  // derive from this list, keeping the header count aligned with rendered rows.
  const normalizedTests = useMemo<NormalizedBranch[]>(() => {
    const branchesByIdentity = new Map<string, NormalizedBranch>();

    for (const key in state.tests) {
      const test = state.tests[key] as TestResult;
      if (!test.obs || !Array.isArray(test.obs) || test.obs.length === 0) {
        continue;
      }

      const groupKey = deriveGroupKey(test.flatName);
      const identity = `${groupKey}_${test.conceptUuid ?? test.flatName}`;
      const existing = branchesByIdentity.get(identity);

      if (existing) {
        existing.flatNames.push(test.flatName);
        existing.obs = mergeObsMultisetMax(existing.obs, test.obs);
      } else {
        branchesByIdentity.set(identity, {
          test,
          stateKey: key,
          flatNames: [test.flatName],
          obs: [...test.obs],
        });
      }
    }

    return [...branchesByIdentity.values()];
  }, [state.tests]);

  const timelineData: TimelineData = useMemo(() => {
    if (!state?.tests) {
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime>, rowData: [], panelName: '' },
        loaded: false,
      };
    }

    const tests = activeTests.length
      ? normalizedTests.filter((branch) => branch.flatNames.some((flatName) => activeTests.includes(flatName)))
      : normalizedTests;

    const allTimes = [
      ...new Set(
        tests
          .map(({ obs }) => obs.map((entry) => entry.obsDatetime))
          .flat()
          .filter(Boolean),
      ),
    ];

    allTimes.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const rows = [];
    tests.forEach(({ test, stateKey, flatNames, obs }) => {
      const newEntries = allTimes.map((time) => obs.find((entry) => entry.obsDatetime === time));
      rows.push({ ...test, key: stateKey, flatNames, obs, entries: newEntries });
    });

    const panelName = 'timeline';
    return {
      data: { parsedTime: parseTime(allTimes), rowData: rows, panelName },
      loaded: true,
    };
  }, [activeTests, normalizedTests, state.tests]);

  const tableData = useMemo<GroupedObservation[]>(() => {
    const flattenedObs: Observation[] = [];

    normalizedTests.forEach(({ test, stateKey, flatNames, obs }) => {
      obs.forEach((ob) => {
        const flattenedEntry = {
          ...test,
          ...ob,
          key: stateKey,
          flatNames,
        };
        flattenedObs.push(flattenedEntry);
      });
    });

    const groupedObs: Record<string, GroupedObservation> = {};

    flattenedObs.forEach((curr: MappedObservation) => {
      const groupKey = deriveGroupKey(curr.flatName);

      const dateKey = new Date(curr.obsDatetime).toISOString().split('T')[0];

      const compositeKey = `${groupKey}__${dateKey}`;
      if (!groupedObs[compositeKey]) {
        groupedObs[compositeKey] = {
          key: groupKey,
          date: dateKey,
          flatName: curr.flatName,
          entries: [],
        };
      }

      groupedObs[compositeKey].entries.push(curr);
    });

    const resultArray = Object.values(groupedObs).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return resultArray;
  }, [normalizedTests]);

  useEffect(() => {
    if (roots.length) {
      actions.initialize(roots); //ensures ui updates when new data comes up
    }
  }, [actions, roots]);

  // Both counts derive from the same normalized branches that tableData
  // renders, so the header count stays aligned with the visible rows.
  const totalResultsCount: number = useMemo(
    () => normalizedTests.reduce((count, branch) => count + branch.obs.length, 0),
    [normalizedTests],
  );

  const filteredResultsCount: number = useMemo(() => {
    if (!someChecked) {
      return totalResultsCount; // No filters applied, show total
    }

    // Count only the tests that are currently selected. Checkboxes are keyed by
    // flatName, so a normalized branch counts if any of its contributing
    // flatNames is checked.
    return normalizedTests.reduce(
      (count, branch) =>
        branch.flatNames.some((flatName) => activeTests.includes(flatName)) ? count + branch.obs.length : count,
      0,
    );
  }, [someChecked, activeTests, normalizedTests, totalResultsCount]);

  return (
    <FilterContext.Provider
      value={{
        ...state,
        timelineData,
        tableData,
        trendlineData: null,
        activeTests,
        someChecked,
        totalResultsCount,
        filteredResultsCount,
        isLoading,
        initialize: actions.initialize,
        toggleVal: actions.toggleVal,
        updateParent: actions.updateParent,
        resetTree: actions.resetTree,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
export { FilterProvider, FilterContext };
