import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parseTime } from '../timeline/useTimelineData';
import reducer from './filter-reducer';
import { TreeNode, FilterContextProps, ReducerState, ReducerActionType, TimelineData } from './filter-types';
import isObject from 'lodash/isObject';

const initialState = {
  checkboxes: {},
  parents: {},
  roots: [{ display: '', flatName: '' }],
  tests: {},
  lowestParents: [],
  basePath: '',
};

const initialContext = {
  state: initialState,
  ...initialState,
  timelineData: null,
  trendlineData: null,
  activeTests: [],
  someChecked: false,
  totalResultsCount: 0,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
  resetTree: () => {},
};

const FilterContext = createContext<FilterContextProps>(initialContext);

export interface FilterProviderProps {
  roots: any[];
  children: React.ReactNode;
  type: string;
  testUuid: string;
  basePath: string;
}

const FilterProvider = ({ roots, children, type, testUuid, basePath }: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();

  const actions = useMemo(
    () => ({
      initialize: (trees: Array<TreeNode>) => dispatch({ type: ReducerActionType.INITIALIZE, trees: trees, basePath }),
      toggleVal: (name: string) => {
        dispatch({ type: ReducerActionType.TOGGLEVAL, name: name });
      },
      updateParent: (name: string) => {
        dispatch({ type: ReducerActionType.UDPATEPARENT, name: name });
      },
      updateBasePath: (basePath: string) => dispatch({ type: ReducerActionType.UPDATEBASEPATH, basePath }),
      resetTree: () => dispatch({ type: ReducerActionType.RESET_TREE }),
    }),
    [dispatch, basePath],
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
      ? Object.fromEntries(Object.entries(state.tests).filter(([name, entry]) => activeTests.includes(name)))
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

  useEffect(() => {
    if (roots?.length && !Object.keys(state?.checkboxes).length) {
      actions.initialize(roots);
    }
  }, [actions, state, roots, basePath]);

  const totalResultsCount: number = useMemo(() => {
    let count = 0;
    if (!state?.tests || !(isObject(state) && isObject(state.tests)) || state?.tests === {}) return 0;
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
        activeTests,
        someChecked,
        totalResultsCount,
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
