const computeParents = (initialState, node) => {
  var parents = {};
  const leaves = [];
  if (node.subSets.length) {
    // has children
    node.subSets.map((subNode) => {
      const { parents: newParents, leaves: newLeaves } = computeParents(initialState, subNode);
      parents = { ...parents, ...newParents };
      leaves.push(...newLeaves);
    });
  }
  if (node.obs.length) {
    leaves.push(...node.obs.map((leaf) => leaf.display));
  }
  parents[node.display] = leaves;
  return { parents: parents, leaves: leaves };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return {
        checkboxes: action.initialState,
        parents: computeParents(action.initialState, action.tree).parents,
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
          [action.name]: !state.checkboxes[action.name],
        },
      };
    case 'updateParent':
      const affectedKids = state.parents[action.name];
      let checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      affectedKids.forEach((kid) => (checkboxes[kid] = !checkboxes[action.name]));
      checkboxes[action.name] = !state.checkboxes[action.name];
      return {
        ...state,
        checkboxes: checkboxes,
      };
    default:
      return state;
  }
};

export default reducer;
