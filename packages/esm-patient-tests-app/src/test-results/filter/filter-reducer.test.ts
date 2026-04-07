import reducer from './filter-reducer';
import { ReducerActionType, type ReducerState, type TreeNode } from './filter-types';

describe('filterReducer', () => {
  const initialState: ReducerState = {
    checkboxes: {},
    parents: {},
    roots: [],
    tests: {},
    lowestParents: [],
  };

  describe('INITIALIZE action', () => {
    it('should initialize checkboxes for all leaf tests', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'CBC',
          display: 'Complete Blood Count',
          subSets: [
            {
              flatName: 'CBC: Hemoglobin',
              display: 'Hemoglobin',
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
              hasData: true,
            },
            {
              flatName: 'CBC: Hematocrit',
              display: 'Hematocrit',
              obs: [{ obsDatetime: '2024-01-01', value: '36', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.checkboxes).toEqual({
        'CBC: Hemoglobin': false,
        'CBC: Hematocrit': false,
      });
    });

    it('should build parent-child relationships for nested tree structure', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'CBC',
          display: 'Complete Blood Count',
          subSets: [
            {
              flatName: 'CBC: Hemoglobin',
              display: 'Hemoglobin',
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
              hasData: true,
            },
            {
              flatName: 'CBC: Hematocrit',
              display: 'Hematocrit',
              obs: [{ obsDatetime: '2024-01-01', value: '36', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.parents['CBC']).toEqual(['CBC: Hemoglobin', 'CBC: Hematocrit']);
      expect(newState.roots).toEqual(mockTrees);
    });

    it('should store tests in tests object keyed by flatName', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'Chemistry',
          display: 'Chemistry Panel',
          subSets: [
            {
              flatName: 'Chemistry: Sodium',
              display: 'Sodium',
              obs: [{ obsDatetime: '2024-01-01', value: '140', interpretation: 'NORMAL' }],
              units: 'mmol/L',
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.tests['Chemistry: Sodium']).toEqual({
        flatName: 'Chemistry: Sodium',
        display: 'Sodium',
        obs: [{ obsDatetime: '2024-01-01', value: '140', interpretation: 'NORMAL' }],
        units: 'mmol/L',
        hasData: true,
      });
    });

    it('should handle multiple trees with independent parent-child relationships', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'CBC',
          display: 'Complete Blood Count',
          subSets: [
            {
              flatName: 'CBC: Hemoglobin',
              display: 'Hemoglobin',
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
        {
          flatName: 'Lipid Panel',
          display: 'Lipid Panel',
          subSets: [
            {
              flatName: 'Lipid Panel: Cholesterol',
              display: 'Cholesterol',
              obs: [{ obsDatetime: '2024-01-01', value: '180', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.parents['CBC']).toEqual(['CBC: Hemoglobin']);
      expect(newState.parents['Lipid Panel']).toEqual(['Lipid Panel: Cholesterol']);
      expect(newState.checkboxes).toEqual({
        'CBC: Hemoglobin': false,
        'Lipid Panel: Cholesterol': false,
      });
    });

    it('should handle deeply nested tree structures', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'Lab Results',
          display: 'Lab Results',
          subSets: [
            {
              flatName: 'Hematology',
              display: 'Hematology',
              subSets: [
                {
                  flatName: 'Hematology: WBC',
                  display: 'White Blood Cell Count',
                  obs: [{ obsDatetime: '2024-01-01', value: '7.5', interpretation: 'NORMAL' }],
                  hasData: true,
                },
              ],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.checkboxes['Hematology: WBC']).toBe(false);
      expect(newState.parents['Hematology']).toEqual(['Hematology: WBC']);
    });

    it('should merge duplicate tests with same flatName', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'Panel1',
          display: 'Panel 1',
          subSets: [
            {
              flatName: 'Test: Glucose',
              display: 'Glucose',
              obs: [{ obsDatetime: '2024-01-01', value: '90', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
        {
          flatName: 'Panel2',
          display: 'Panel 2',
          subSets: [
            {
              flatName: 'Test: Glucose',
              display: 'Glucose',
              obs: [{ obsDatetime: '2024-01-02', value: '95', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.tests['Test: Glucose'].obs).toHaveLength(2);
      expect(newState.tests['Test: Glucose'].obs).toEqual([
        { obsDatetime: '2024-01-01', value: '90', interpretation: 'NORMAL' },
        { obsDatetime: '2024-01-02', value: '95', interpretation: 'NORMAL' },
      ]);
    });

    it('should identify lowestParents with children that have data', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'CBC',
          display: 'Complete Blood Count',
          subSets: [
            {
              flatName: 'CBC: Hemoglobin',
              display: 'Hemoglobin',
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.lowestParents).toHaveLength(1);
      expect(newState.lowestParents[0].flatName).toBe('CBC');
    });

    it('should preserve existing checkbox selections when re-initialized with new data', () => {
      const stateWithSelections: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': true,
          'CBC: Hematocrit': false,
        },
      };

      const updatedTrees: Array<TreeNode> = [
        {
          flatName: 'CBC',
          display: 'Complete Blood Count',
          subSets: [
            {
              flatName: 'CBC: Hemoglobin',
              display: 'Hemoglobin',
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
              hasData: true,
            },
            {
              flatName: 'CBC: Hematocrit',
              display: 'Hematocrit',
              obs: [{ obsDatetime: '2024-01-01', value: '36', interpretation: 'NORMAL' }],
              hasData: true,
            },
            {
              flatName: 'CBC: WBC',
              display: 'White Blood Cell Count',
              obs: [{ obsDatetime: '2024-01-01', value: '7.5', interpretation: 'NORMAL' }],
              hasData: true,
            },
          ],
          hasData: true,
        },
      ];

      const newState = reducer(stateWithSelections, {
        type: ReducerActionType.INITIALIZE,
        trees: updatedTrees,
      });

      expect(newState.checkboxes).toEqual({
        'CBC: Hemoglobin': true,
        'CBC: Hematocrit': false,
        'CBC: WBC': false,
      });
    });

    it('should handle leaf nodes without subSets', () => {
      const mockTrees: Array<TreeNode> = [
        {
          flatName: 'Standalone Test',
          display: 'Standalone Test',
          obs: [{ obsDatetime: '2024-01-01', value: '100', interpretation: 'NORMAL' }],
          hasData: true,
        },
      ];

      const newState = reducer(initialState, {
        type: ReducerActionType.INITIALIZE,
        trees: mockTrees,
      });

      expect(newState.checkboxes['Standalone Test']).toBe(false);
      expect(newState.tests['Standalone Test']).toBeDefined();
    });
  });

  describe('TOGGLE_CHECKBOX action', () => {
    it('should toggle a single checkbox from false to true', () => {
      const stateWithCheckboxes: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': false,
          'CBC: Hematocrit': false,
        },
      };

      const newState = reducer(stateWithCheckboxes, {
        type: ReducerActionType.TOGGLE_CHECKBOX,
        name: 'CBC: Hemoglobin',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(true);
      expect(newState.checkboxes['CBC: Hematocrit']).toBe(false);
    });

    it('should toggle a single checkbox from true to false', () => {
      const stateWithCheckboxes: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': true,
          'CBC: Hematocrit': true,
        },
      };

      const newState = reducer(stateWithCheckboxes, {
        type: ReducerActionType.TOGGLE_CHECKBOX,
        name: 'CBC: Hemoglobin',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(false);
      expect(newState.checkboxes['CBC: Hematocrit']).toBe(true);
    });

    it('should not affect other checkboxes when toggling one', () => {
      const stateWithCheckboxes: ReducerState = {
        ...initialState,
        checkboxes: {
          Test1: false,
          Test2: true,
          Test3: false,
        },
      };

      const newState = reducer(stateWithCheckboxes, {
        type: ReducerActionType.TOGGLE_CHECKBOX,
        name: 'Test2',
      });

      expect(newState.checkboxes).toEqual({
        Test1: false,
        Test2: false,
        Test3: false,
      });
    });
  });

  describe('TOGGLE_PARENT action', () => {
    it('should uncheck all children when they are all checked', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': true,
          'CBC: Hematocrit': true,
          'CBC: WBC': true,
        },
        parents: {
          CBC: ['CBC: Hemoglobin', 'CBC: Hematocrit', 'CBC: WBC'],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'CBC',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(false);
      expect(newState.checkboxes['CBC: Hematocrit']).toBe(false);
      expect(newState.checkboxes['CBC: WBC']).toBe(false);
    });

    it('should check all children when any child is unchecked', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': true,
          'CBC: Hematocrit': false,
          'CBC: WBC': true,
        },
        parents: {
          CBC: ['CBC: Hemoglobin', 'CBC: Hematocrit', 'CBC: WBC'],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'CBC',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(true);
      expect(newState.checkboxes['CBC: Hematocrit']).toBe(true);
      expect(newState.checkboxes['CBC: WBC']).toBe(true);
    });

    it('should check all children when all children are unchecked', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': false,
          'CBC: Hematocrit': false,
        },
        parents: {
          CBC: ['CBC: Hemoglobin', 'CBC: Hematocrit'],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'CBC',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(true);
      expect(newState.checkboxes['CBC: Hematocrit']).toBe(true);
    });

    it('should not affect children of other parents', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          'CBC: Hemoglobin': true,
          'Lipid: Cholesterol': true,
        },
        parents: {
          CBC: ['CBC: Hemoglobin'],
          Lipid: ['Lipid: Cholesterol'],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'CBC',
      });

      expect(newState.checkboxes['CBC: Hemoglobin']).toBe(false);
      expect(newState.checkboxes['Lipid: Cholesterol']).toBe(true);
    });

    it('should handle parent with no children gracefully', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          Test1: false,
        },
        parents: {
          EmptyParent: [],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'EmptyParent',
      });

      expect(newState.checkboxes).toEqual({ Test1: false });
    });

    it('should handle parent that does not exist in parents mapping', () => {
      const stateWithParents: ReducerState = {
        ...initialState,
        checkboxes: {
          Test1: false,
        },
        parents: {
          CBC: ['CBC: Hemoglobin'],
        },
      };

      const newState = reducer(stateWithParents, {
        type: ReducerActionType.TOGGLE_PARENT,
        name: 'NonExistentParent',
      });

      expect(newState.checkboxes).toEqual({ Test1: false });
    });
  });

  describe('RESET_TREE action', () => {
    it('should reset all checkboxes to false', () => {
      const stateWithMixedCheckboxes: ReducerState = {
        ...initialState,
        checkboxes: {
          Test1: true,
          Test2: false,
          Test3: true,
          Test4: false,
        },
      };

      const newState = reducer(stateWithMixedCheckboxes, {
        type: ReducerActionType.RESET_TREE,
      });

      expect(newState.checkboxes).toEqual({
        Test1: false,
        Test2: false,
        Test3: false,
        Test4: false,
      });
    });

    it('should not affect other state properties', () => {
      const stateWithData: ReducerState = {
        checkboxes: { Test1: true, Test2: true },
        parents: { Parent1: ['Test1', 'Test2'] },
        roots: [{ flatName: 'Root', display: 'Root', hasData: true }],
        tests: { Test1: { flatName: 'Test1', display: 'Test1' } },
        lowestParents: [{ flatName: 'Parent1', display: 'Parent1' }],
      };

      const newState = reducer(stateWithData, {
        type: ReducerActionType.RESET_TREE,
      });

      expect(newState.checkboxes).toEqual({ Test1: false, Test2: false });
      expect(newState.parents).toEqual({ Parent1: ['Test1', 'Test2'] });
      expect(newState.roots).toEqual(stateWithData.roots);
      expect(newState.tests).toEqual(stateWithData.tests);
      expect(newState.lowestParents).toEqual(stateWithData.lowestParents);
    });

    it('should handle empty checkboxes object', () => {
      const stateWithNoCheckboxes: ReducerState = {
        ...initialState,
        checkboxes: {},
      };

      const newState = reducer(stateWithNoCheckboxes, {
        type: ReducerActionType.RESET_TREE,
      });

      expect(newState.checkboxes).toEqual({});
    });
  });

  describe('Default case', () => {
    it('should return unchanged state for unknown action type', () => {
      const currentState: ReducerState = {
        checkboxes: { Test1: true },
        parents: {},
        roots: [],
        tests: {},
        lowestParents: [],
      };

      const newState = reducer(currentState, {
        type: 'UNKNOWN_ACTION' as any,
      });

      expect(newState).toEqual(currentState);
    });
  });
});
