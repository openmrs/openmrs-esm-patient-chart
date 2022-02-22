import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import reducer from './filter-reducer';
import mockConceptTree from '../hiv/mock-concept-tree';

const initialState = {
  checkboxes: {},
  parents: {},
};

const initialContext = {
  state: initialState,
  checkboxes: {},
  parents: {},
  activeTests: [],
  someChecked: false,
  initialize: () => {},
  toggleVal: () => {},
  updateParent: () => {},
};

interface StateProps {
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
}
interface FilterContextProps {
  state: StateProps;
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  activeTests: string[];
  someChecked: boolean;
  initialize: any;
  toggleVal: any;
  updateParent: any;
}

interface FilterProviderProps {
  sortedObs: any; // this data structure will change later
  children: React.ReactNode;
}

const FilterContext = createContext<FilterContextProps>(initialContext);

const FilterProvider = ({ sortedObs, children }: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      initialize: (tree) => dispatch({ type: 'initialize', tree: tree }),
      toggleVal: (name) => {
        dispatch({ type: 'toggleVal', name: name });
      },
      updateParent: (name) => {
        dispatch({ type: 'updateParent', name: name });
      },
    }),
    [dispatch],
  );

  const activeTests = Object.keys(state?.checkboxes)?.filter((key) => state.checkboxes[key]) || [];
  const someChecked = Boolean(activeTests.length);

  useEffect(() => {
    const tests = (sortedObs && Object.keys(sortedObs)) || [];
    if (tests.length && !Object.keys(state?.checkboxes).length) {
      actions.initialize(mockConceptTree);
    }
  }, [sortedObs, actions, state]);

  return (
    <FilterContext.Provider
      value={{
        state,
        checkboxes: state.checkboxes,
        parents: state.parents,
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
