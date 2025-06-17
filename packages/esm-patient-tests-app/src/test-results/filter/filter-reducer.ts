import {
  ReducerActionType,
  type LowestNode,
  type ReducerAction,
  type ReducerState,
  type TreeNode,
  type TreeParents,
} from './filter-types';

export const getName = (prefix, name) => {
  return prefix ? `${prefix}-${name}` : name;
};

export const getDisplayFromFlatName = (flatName: string) => {
  return flatName.split('-').pop();
};

const computeParents = (
  prefix: string,
  node: TreeNode,
): {
  parents: TreeParents;
  leaves: Array<string>;
  tests: Array<[string, TreeNode]>;
  lowestParents: Array<LowestNode>;
} => {
  let parents: TreeParents = {};
  const leaves: Array<string> = [];
  const tests: Array<[string, TreeNode]> = [];
  const lowestParents: Array<LowestNode> = [];
  if (node?.subSets?.length && node.subSets[0].obs) {
    // lowest parent
    const activeLeaves: Array<string> = [];
    node.subSets.forEach((leaf) => {
      if (leaf.hasData) {
        activeLeaves.push(leaf.flatName);
      }
    });
    const activeTests: Array<[string, TreeNode]> = [];
    node.subSets.forEach((leaf) => {
      if (Array.isArray(leaf?.obs) && leaf.obs.length > 0) {
        activeTests.push([leaf.flatName, leaf]);
      }
    });
    leaves.push(...activeLeaves);
    tests.push(...activeTests);
    lowestParents.push({ flatName: node.flatName, display: node.display });
  } else if (node?.subSets?.length) {
    node.subSets.forEach((subNode) => {
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

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case ReducerActionType.INITIALIZE: {
      let parents: TreeParents = {},
        leaves: Array<string> = [],
        tests: Array<[string, TreeNode]> = [],
        lowestParents: Array<LowestNode> = [];
      action.trees?.forEach((tree) => {
        // if anyone knows a shorthand for this i'm stoked to learn it :)
        const { parents: newParents, leaves: newLeaves, lowestParents: newLP } = computeParents('', tree);
        parents = { ...parents, ...newParents };
        leaves = [...leaves, ...newLeaves];
        lowestParents = [...lowestParents, ...newLP];
      });

      action.filteredTrees?.forEach((tree) => {
        // if anyone knows a shorthand for this i'm stoked to learn it :)
        const { tests: newTests } = computeParents('', tree);
        tests = [...tests, ...newTests];
      });

      const flatTests = Object.fromEntries(tests);

      return {
        checkboxes: Object.fromEntries(leaves?.map((leaf) => [leaf, false])) || {},
        parents: parents,
        roots: action.trees,
        tests: flatTests,
        lowestParents: lowestParents,
      };
    }
    case ReducerActionType.TOGGLEVAL: {
      const suffix = getDisplayFromFlatName(action.name);
      const affectedLeaves = Object.keys(state.checkboxes).filter((key) => key.endsWith(suffix));
      const checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      const allChecked = affectedLeaves.every((leaf) => checkboxes[leaf]);
      affectedLeaves.forEach((leaf) => (checkboxes[leaf] = !allChecked));
      return {
        ...state,
        checkboxes: checkboxes,
      };
    }

    case ReducerActionType.UDPATEPARENT: {
      const checkedLeaves = state.parents[action.name];
      const suffixes = checkedLeaves.map((target) => getDisplayFromFlatName(target));
      const affectedLeaves = [];

      for (const key in state.parents) {
        const values = state.parents[key];
        for (const item of values) {
          for (const suffix of suffixes) {
            if (item.endsWith(suffix)) {
              affectedLeaves.push(item);
            }
          }
        }
      }
      const checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      const allChecked = affectedLeaves.every((leaf) => checkboxes[leaf]);
      affectedLeaves.forEach((leaf) => (checkboxes[leaf] = !allChecked));
      return {
        ...state,
        checkboxes: checkboxes,
      };
    }

    case ReducerActionType.RESET_TREE:
      return {
        ...state,
        checkboxes: Object.fromEntries(Object.keys(state?.checkboxes)?.map((leaf) => [leaf, false])),
      };

    default:
      return state;
  }
}

export default reducer;
