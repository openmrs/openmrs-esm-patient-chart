import React, { createContext, useReducer, useEffect, useMemo, useState } from 'react';
import { parseTime } from '../timeline/useTimelineData';
import reducer from './filter-reducer';
import { TreeNode } from './filter-set';

const initialState = {
  checkboxes: {},
  parents: {},
  roots: [{ display: '', flatName: '' }],
  tests: {},
  lowestParents: [],
};

const initialContext = {
  state: initialState,
  ...initialState,
  timelineData: {},
  activeTests: [],
  someChecked: false,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
};

interface StateProps {
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  roots: { [key: string]: any }[];
}
interface FilterContextProps {
  state: StateProps;
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  roots: TreeNode[];
  tests: { [key: string]: any };
  lowestParents: { display: string; flatName: string }[];
  timelineData: { [key: string]: any };
  activeTests: string[];
  someChecked: boolean;
  initialize: any;
  toggleVal: any;
  updateParent: any;
}

interface FilterProviderProps {
  roots: any[];
  children: React.ReactNode;
}

interface obsShape {
  [key: string]: any;
}

const FilterContext = createContext<FilterContextProps>(initialContext);

const FilterProvider = ({ roots, children }: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      initialize: (trees) => dispatch({ type: 'initialize', trees: trees }),
      toggleVal: (name) => {
        dispatch({ type: 'toggleVal', name: name });
      },
      updateParent: (name) => {
        dispatch({ type: 'updateParent', name: name });
      },
    }),
    [dispatch],
  );

  const activeTests = useMemo(() => {
    return Object.keys(state?.checkboxes)?.filter((key) => state.checkboxes[key]) || [];
  }, [state.checkboxes]);

  const someChecked = Boolean(activeTests.length);

  const timelineData = useMemo(() => {
    if (!state?.tests) {
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime>, rowData: [], panelName: '' },
        loaded: false,
      };
    }
    const tests: obsShape = activeTests?.length
      ? Object.fromEntries(Object.entries(state.tests).filter(([name, entry]) => activeTests.includes(name)))
      : state.tests;

    const allTimes = [
      ...new Set(
        Object.values(tests)
          .map((test: obsShape) => test?.obs?.map((entry) => entry.obsDatetime))
          .flat(),
      ),
    ];
    allTimes.sort((a, b) => (new Date(a) < new Date(b) ? 1 : -1));
    const rows = [];
    Object.keys(tests).forEach((test) => {
      const newEntries = allTimes.map((time: string) => tests[test].obs.find((entry) => entry.obsDatetime === time));
      rows.push({ ...tests[test], entries: newEntries });
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
  }, [actions, state, roots]);

  return (
    <FilterContext.Provider
      value={{
        state,
        checkboxes: state.checkboxes,
        parents: state.parents,
        roots: state.roots,
        tests: state.tests,
        lowestParents: state.lowestParents,
        timelineData,
        activeTests,
        someChecked,
        initialize: actions.initialize,
        toggleVal: actions.toggleVal,
        updateParent: actions.updateParent,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
export { FilterProvider };
