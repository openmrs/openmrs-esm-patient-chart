import {
  ReducerActionType,
  type LowestNode,
  type ObservationData,
  type ReducerAction,
  type ReducerState,
  type TreeNode,
  type TreeParents,
} from './filter-types';

// Merge two copies of a concept's obs list as a multiset union: for each
// (obsDatetime, value) identity, keep the highest count seen in either list.
// The obstree backend serializes a concept's full obs list once per branch, so
// equal obs within one list are genuinely distinct results, while equal lists
// across branches are copies of the same results. obsDatetime + value is the
// best identity available until the backend exposes obs uuids; it cannot
// distinguish a copy from a real duplicate that only ever appears in separate
// lists, which is a documented limitation rather than a bug to fix here.
export function mergeObsMultisetMax(
  existing: Array<ObservationData>,
  incoming: Array<ObservationData>,
): Array<ObservationData> {
  const merged = [...existing];
  const existingCounts = new Map<string, number>();
  for (const obs of existing) {
    const id = `${obs.obsDatetime}|${obs.value}`;
    existingCounts.set(id, (existingCounts.get(id) ?? 0) + 1);
  }
  const incomingCounts = new Map<string, number>();
  for (const obs of incoming) {
    const id = `${obs.obsDatetime}|${obs.value}`;
    const seen = (incomingCounts.get(id) ?? 0) + 1;
    incomingCounts.set(id, seen);
    if (seen > (existingCounts.get(id) ?? 0)) {
      merged.push(obs);
    }
  }
  return merged;
}

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

      // Tests reached through overlapping roots can resolve to the same flatName,
      // each branch carrying a copy of the same concept's obs list. Merge the
      // copies with a multiset-max union rather than concatenating, and copy the
      // node so the SWR-cached trees are never mutated and INITIALIZE stays
      // idempotent across re-dispatches.
      const flatTests: Record<string, TreeNode> = {};
      tests.forEach(([key, test]) => {
        const existing = flatTests[key];
        if (!existing) {
          flatTests[key] = { ...test, obs: test.obs ? [...test.obs] : test.obs };
        } else if (test.obs && Array.isArray(test.obs)) {
          existing.obs = mergeObsMultisetMax(existing.obs ?? [], test.obs);
        }
      });

      return {
        checkboxes: Object.fromEntries(leaves.map((leaf) => [leaf, state.checkboxes[leaf] ?? false])),
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
