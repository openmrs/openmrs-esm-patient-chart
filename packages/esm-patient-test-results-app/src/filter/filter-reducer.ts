export const getName = (prefix, name) => {
  return prefix ? `${prefix}-${name}` : name;
};

const computeParents = (prefix, node) => {
  var parents = {};
  var leaves = [];
  var tests = [];
  var lowestParents = [];
  if (node?.subSets?.length && node.subSets[0].obs) {
    // lowest parent
    let activeLeaves = [];
    node.subSets.forEach((leaf) => {
      if (leaf.hasData) {
        activeLeaves.push(leaf.flatName);
      }
    });
    let activeTests = [];
    node.subSets.forEach((leaf) => {
      if (leaf.obs.length) {
        activeTests.push([leaf.flatName, leaf]);
      }
    });
    leaves.push(...activeLeaves);
    tests.push(...activeTests);
    lowestParents.push({ flatName: node.flatName, display: node.display });
  } else if (node?.subSets?.length) {
    node.subSets.map((subNode) => {
      const {
        parents: newParents,
        leaves: newLeaves,
        tests: newTests,
        lowestParents: newLowestParents,
      } = computeParents(getName(prefix, node.display), subNode);
      parents = { ...parents, ...newParents };
      leaves.push(...newLeaves);
      tests.push(...newTests);
      lowestParents.push(...newLowestParents);
    });
  }
  parents[node.flatName] = leaves;
  return { parents, leaves, tests, lowestParents };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      const { parents, leaves, tests, lowestParents } = computeParents('', action.tree);
      const flatTests = Object.fromEntries(tests);
      return {
        checkboxes: Object.fromEntries(leaves?.map((leaf) => [leaf, false])) || {},
        parents: parents,
        root: action.tree,
        tests: flatTests,
        lowestParents: lowestParents,
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
