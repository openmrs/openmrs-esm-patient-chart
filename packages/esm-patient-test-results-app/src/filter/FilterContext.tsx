import React, { createContext, useReducer, useState } from 'react';
import reducer from './filterReducer';

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

const FilterContext = createContext<FilterContextProps>(initialContext);

const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    initialize: (initialState, tree) => dispatch({ type: 'initialize', initialState: initialState, tree: tree }),
    toggleVal: (name) => {
      dispatch({ type: 'toggleVal', name: name });
    },
    updateParent: (name) => {
      dispatch({ type: 'updateParent', name: name });
    },
  };

  const activeTests = Object.keys(state?.checkboxes)?.filter((key) => state.checkboxes[key]) || [];
  const someChecked = Boolean(activeTests.length);

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
