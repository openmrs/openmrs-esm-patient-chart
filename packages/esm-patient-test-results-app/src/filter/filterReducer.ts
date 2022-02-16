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
  leaves.push(node.display);
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
      // copy the starting state
      let checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      // update all kids
      affectedKids.forEach((kid) => (checkboxes[kid] = !checkboxes[action.name]));
      // toggle this box
      checkboxes[action.name] = !state.checkboxes[action.name];
      // look for all parents of this checkbox
      Object.entries(state.parents).forEach(([parent, children]: [string, string[]]) => {
        if (children.includes(action.name)) {
          checkboxes[parent] = !state.checkboxes[action.name];
        }
      });
      return {
        ...state,
        checkboxes: checkboxes,
      };
    default:
      return state;
  }
};

export default reducer;
