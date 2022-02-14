const computeParents = (initialState, tree) => {
  return tree;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return {
        checkboxes: action.initialState,
        parents: computeParents(action.initialState, action.tree),
      };
    case 'updateCheckboxes':
      return {
        ...state,
        checkboxes: {
          ...state.checkboxes,
          ...action.payload,
        },
      };
    case 'toggleVal':
      return {
        ...state,
        checkboxes: {
          ...state.checkboxes,
          [action.name]: !state[action.name],
        },
      };
    default:
      return state;
  }
};

export default reducer;
