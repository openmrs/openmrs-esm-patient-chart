const computeParents = (node) => {
  var parents = {};
  const leaves = [];
  if (node?.subSets?.length) {
    node.subSets.map((subNode) => {
      const { parents: newParents, leaves: newLeaves } = computeParents(subNode);
      parents = { ...parents, ...newParents };
      leaves.push(...newLeaves);
    });
  }
  if (node?.obs?.length) {
    leaves.push(...node.obs.map((leaf) => leaf.display));
  }
  parents[node.display] = leaves;
  return { parents: parents, leaves: leaves };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      const { parents, leaves } = computeParents(action.tree);
      return {
        checkboxes: Object.fromEntries(leaves?.map((leaf) => [leaf, true])) || {},
        parents: parents,
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
      const affectedLeaves = state.parents[action.name];
      let checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      const allChecked = affectedLeaves.every((leaf) => checkboxes[leaf]);
      affectedLeaves.forEach((leaf) => (checkboxes[leaf] = !allChecked));
      return {
        ...state,
        checkboxes: checkboxes,
      };
    default:
      return state;
  }
};

export default reducer;
