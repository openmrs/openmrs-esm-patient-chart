import React, { createContext, useReducer, useState } from 'react';
import reducer from './filterReducer';

const initialContext = {
  checkboxes: {},
  parents: {},
};

interface FilterContextProps {
  state?: any;
  checkboxes: any;
  parents: any;
  activeTests?: any[];
  updateCheckboxes?: any;
  initialize?: any;
  toggleVal?: any;
  someChecked?: boolean;
  updateParent?: any;
}

const FilterContext = createContext<FilterContextProps>(initialContext);

const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialContext);

  const actions = {
    initialize: (initialState, tree) => dispatch({ type: 'initialize', initialState: initialState, tree: tree }),
    updateCheckboxes: (changes) => {
      dispatch({ type: 'updateCheckboxes', payload: changes });
    },
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
        updateCheckboxes: actions.updateCheckboxes,
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
