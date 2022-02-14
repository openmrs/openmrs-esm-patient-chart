import React, { createContext, useReducer, useState } from 'react';
import reducer from './filterReducer';

interface FilterContextProps {
  state?: any;
  activeTests?: any[];
  updateState?: any;
  initialize?: any;
  toggleVal?: any;
  someChecked?: boolean;
}

const FilterContext = createContext<FilterContextProps>({});

const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {});

  const actions = {
    initialize: (initialState) => dispatch({ type: 'initialize', payload: initialState }),
    update: (changes) => {
      dispatch({ type: 'update', payload: changes });
    },
    toggleVal: (name) => {
      dispatch({ type: 'toggleVal', name: name });
    },
  };

  const activeTests = Object.keys(state).filter((key) => state[key]);
  const someChecked = Object.values(state).some((val) => val);

  return (
    <FilterContext.Provider
      value={{
        state,
        activeTests,
        someChecked,
        initialize: actions.initialize,
        updateState: actions.update,
        toggleVal: actions.toggleVal,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
export { FilterProvider };
