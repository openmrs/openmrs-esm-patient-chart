import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parseTime } from '../timeline/useTimelineData';
import reducer from './filter-reducer';
import {
  TreeNode,
  FilterContextProps,
  ReducerState,
  ReducerAction,
  ReducerActionType,
  TrendlineData,
} from './filter-types';
import { ScaleTypes, LineChartOptions, TickRotations } from '@carbon/charts/interfaces';

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
  timelineData: {},
  trendlineData: null,
  activeTests: [],
  someChecked: false,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
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

  const trendlineData: TrendlineData = useMemo(() => {
    const test = Object.values(state.tests).find((testObj) => testObj?.conceptUuid === testUuid);

    if (!test || type !== 'trendline' || !testUuid) {
      return {
        isLoading: true,
        hiNormal: null,
        lowNormal: null,
        obs: [],
        title: '',
        bottomAxisTitle: '',
        leftAxisTitle: '',
        referenceRange: '',
      };
    }

    console.log(test);

    return {
      isLoading: false,
      hiNormal: test?.hiNormal,
      lowNormal: test?.lowNormal,
      obs: test?.obs,
      title: test?.display,
      bottomAxisTitle: t('date', 'Date'),
      leftAxisTitle: test?.units,
      referenceRange: test?.range,
    };
  }, [t, type, testUuid, state.tests]);

  console.log(trendlineData);

  useEffect(() => {
    if (roots?.length && !Object.keys(state?.checkboxes).length) {
      actions.initialize(roots);
    }
  }, [actions, state, roots, basePath]);

  return (
    <FilterContext.Provider
      value={{
        state,
        basePath,
        checkboxes: state.checkboxes,
        parents: state.parents,
        roots: state.roots,
        tests: state.tests,
        lowestParents: state.lowestParents,
        timelineData,
        trendlineData,
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
export { FilterProvider, FilterContext };
