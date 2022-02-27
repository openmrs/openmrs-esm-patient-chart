const computeParents = (node) => {
  var parents = {};
  const leaves = [];
  const tests = [];
  if (node?.subSets?.length && node.subSets[0].datatype) {
    leaves.push(...node.subSets.map((leaf) => leaf.display));
    tests.push(
      ...node.subSets.map((leaf) => {
        const { display, ...rest } = leaf;
        return [display, rest];
      }),
    );
  } else if (node?.subSets?.length) {
    node.subSets.map((subNode) => {
      const { parents: newParents, leaves: newLeaves, tests: newTests } = computeParents(subNode);
      parents = { ...parents, ...newParents };
      leaves.push(...newLeaves);
      tests.push(...newTests);
    });
  }
  parents[node.display] = leaves;
  return { parents, leaves, tests };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      const { parents, leaves, tests } = computeParents(action.tree);
      const flatTests = Object.fromEntries(tests);
      return {
        checkboxes: Object.fromEntries(leaves?.map((leaf) => [leaf, true])) || {},
        parents: parents,
        root: action.tree,
        tests: flatTests,
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
