import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { isObject } from 'lodash-es';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import {
  type TreeNode,
  type FilterContextProps,
  type ReducerState,
  ReducerActionType,
  type TimelineData,
} from './filter-types';
import reducer from './filter-reducer';
import { type MappedObservation, type TestResult, type GroupedObservation, type Observation } from '../../types';

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
  isLoading: false,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
  resetTree: () => {},
};

const FilterContext = createContext<FilterContextProps>(initialContext);

export interface FilterProviderProps {
  roots: any[];
  isLoading: boolean;
  children: React.ReactNode;
}

const FilterProvider = ({ roots, isLoading, children }: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      initialize: (trees: Array<TreeNode>) => dispatch({ type: ReducerActionType.INITIALIZE, trees: trees }),
      toggleVal: (name: string) => {
        dispatch({ type: ReducerActionType.TOGGLEVAL, name: name });
      },
      updateParent: (name: string) => {
        dispatch({ type: ReducerActionType.UDPATEPARENT, name: name });
      },
      resetTree: () => dispatch({ type: ReducerActionType.RESET_TREE }),
    }),
    [dispatch],
  );

  const activeTests = useMemo(() => {
    return Object.keys(state?.checkboxes)?.filter((key) => state.checkboxes[key]) || [];
  }, [state.checkboxes]);

  const someChecked = Boolean(activeTests.length);

  const timelineData: TimelineData = useMemo(() => {
    if (!state?.tests) {
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime>, rowData: [], panelName: '' },
        loaded: false,
      };
    }
    const tests: ReducerState['tests'] = activeTests?.length
      ? Object.fromEntries(Object.entries(state.tests).filter(([name]) => activeTests.includes(name)))
      : state.tests;

    const allTimes = [
      ...new Set(
        Object.values(tests)
          .map((test: ReducerState['tests']) => test?.obs?.map((entry) => entry.obsDatetime))
          .flat(),
      ),
    ];
    allTimes.sort((a, b) => (new Date(a) < new Date(b) ? 1 : -1));
    const rows = [];
    Object.values(tests).forEach((testData) => {
      const newEntries = allTimes.map((time) => testData.obs.find((entry) => entry.obsDatetime === time));
      rows.push({ ...testData, entries: newEntries });
    });
    const panelName = 'timeline';
    return {
      data: { parsedTime: parseTime(allTimes), rowData: rows, panelName },
      loaded: true,
    };
  }, [activeTests, state.tests]);

  const tableData = useMemo<GroupedObservation[]>(() => {
    const flattenedObs: Observation[] = [];

    for (const key in state.tests) {
      const test = state.tests[key] as TestResult;
      if (test.obs && Array.isArray(test.obs)) {
        test.obs.forEach((obs) => {
          const flattenedEntry = {
            ...obs,
            key: key,
            ...test,
          };
          flattenedObs.push(flattenedEntry);
        });
      }
    }

    const groupedObs: Record<string, GroupedObservation> = {};

    flattenedObs.forEach((curr: MappedObservation) => {
      const flatNameParts = curr.flatName.split('-');
      const groupKey = flatNameParts.length > 1 ? flatNameParts[1].trim() : flatNameParts[0].trim();
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
  }, [state.tests]);

  useEffect(() => {
    if (roots?.length && !Object.keys(state?.parents).length) {
      actions.initialize(roots);
    }
  }, [actions, state, roots]);

  const totalResultsCount: number = useMemo(() => {
    let count = 0;
    if (!state?.tests || !isObject(state?.tests) || Object.keys(state?.tests).length === 0) return 0;
    Object.values(state?.tests).forEach((testData) => {
      count += testData.obs.length;
    });
    return count;
  }, [state?.tests]);

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
