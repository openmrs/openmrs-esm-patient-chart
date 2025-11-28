import {
  ReducerActionType,
  type LowestNode,
  type ReducerAction,
  type ReducerState,
  type TreeNode,
  type TreeParents,
} from './filter-types';

const ROOT_PREFIX = '';

export const getName = (prefix: string | undefined, name: string): string => {
  return prefix ? `${prefix}-${name}` : name;
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

  if (node?.obs && Array.isArray(node.obs) && node.obs.length > 0) {
    // This is a leaf test (Test concept) - has obs data
    leaves.push(node.flatName);
    tests.push([node.flatName, node]);
  } else if (node?.subSets && Array.isArray(node.subSets) && node.subSets.length > 0) {
    // parent category - recursively process children

    const childResults = node.subSets
      .map((subNode) => {
        if (subNode) {
          // Don't add the current node's display name as a prefix
          // This prevents creating "Bloodwork-Hematology-..." names
          return computeParents(prefix, subNode);
        }
        return null;
      })
      .filter(Boolean);

    // Merge results from children
    childResults.forEach((result) => {
      if (result) {
        parents = { ...parents, ...result.parents };
        leaves.push(...result.leaves);
        tests.push(...result.tests);
        lowestParents.push(...result.lowestParents);
      }
    });

    // Check if this parent should be added to lowestParents
    // A parent should be in lowestParents if it has children with actual data
    const hasChildrenWithData = node.subSets.some((subNode) => subNode?.hasData);
    if (hasChildrenWithData) {
      lowestParents.push(node as LowestNode);
    }
  } else {
    // This is a leaf test (Test concept) - no subSets, should be treated as individual test
    leaves.push(node.flatName);
    tests.push([node.flatName, node]);
  }

  // Use the node's flatName for parent mapping to match the data augmentation
  parents[node.flatName || node.display] = leaves;

  return { parents, leaves, tests, lowestParents };
};

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case ReducerActionType.INITIALIZE: {
      let parents: TreeParents = {};
      let leaves: Array<string> = [];
      let tests: Array<[string, TreeNode]> = [];
      let lowestParents: Array<LowestNode> = [];

      action.trees.forEach((tree) => {
        // Process each tree node to build the filter structure
        const {
          parents: newParents,
          leaves: newLeaves,
          tests: newTests,
          lowestParents: newLowestParents,
        } = computeParents(ROOT_PREFIX, tree);
        parents = { ...parents, ...newParents };
        leaves = [...leaves, ...newLeaves];
        tests = [...tests, ...newTests];
        lowestParents = [...lowestParents, ...newLowestParents];
      });

      // Handle duplicate keys by merging tests with the same flatName
      const flatTests: Record<string, TreeNode> = {};
      tests.forEach(([key, test]) => {
        if (flatTests[key]) {
          // If we already have this test, merge the obs data
          if (test.obs && Array.isArray(test.obs)) {
            if (!flatTests[key].obs) {
              flatTests[key].obs = [];
            }
            flatTests[key].obs.push(...test.obs);
          }
        } else {
          flatTests[key] = test;
        }
      });

      return {
        checkboxes: Object.fromEntries(leaves.map((leaf) => [leaf, false])),
        parents: parents,
        roots: action.trees,
        tests: flatTests,
        lowestParents: lowestParents,
      };
    }
    case ReducerActionType.TOGGLE_CHECKBOX: {
      return {
        ...state,
        checkboxes: {
          ...state.checkboxes,
          [action.name]: !state.checkboxes[action.name],
        },
      };
    }

    case ReducerActionType.TOGGLE_PARENT: {
      const affectedLeaves = state.parents[action.name];
      const checkboxes = { ...state.checkboxes };

      if (affectedLeaves && Array.isArray(affectedLeaves)) {
        const allChecked = affectedLeaves.every((leaf) => checkboxes[leaf]);
        affectedLeaves.forEach((leaf) => (checkboxes[leaf] = !allChecked));
      }

      return {
        ...state,
        checkboxes: checkboxes,
      };
    }

    case ReducerActionType.RESET_TREE:
      return {
        ...state,
        checkboxes: Object.fromEntries(Object.keys(state.checkboxes).map((leaf) => [leaf, false])),
      };

    default:
      return state;
  }
}

export default reducer;
