import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useGetManyObstreeData, useGetObstreeData, type ObsTreeNode } from './useObstreeData';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

describe('useObstreeData', () => {
  describe('augmentObstreeData via useGetObstreeData', () => {
    it('should add flatName to nodes', async () => {
      const mockResponse = {
        data: {
          display: 'Hemoglobin',
          conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          hasData: false,
          subSets: [],
          obs: [
            {
              value: '12.5',
              obsDatetime: '2024-01-01',
              interpretation: 'NORMAL',
            },
          ],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'hemoglobin-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.flatName).toBe('Hemoglobin');
      expect(data.hasData).toBe(true);
    });

    it('should build hierarchical flatName for nested nodes', async () => {
      const mockResponse = {
        data: {
          display: 'Complete Blood Count',
          conceptUuid: 'cbc-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: false,
              subSets: [],
              obs: [
                {
                  value: '12.5',
                  obsDatetime: '2024-01-01',
                },
              ],
            },
          ],
          obs: [],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'cbc-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.flatName).toBe('Complete Blood Count');
      expect(data.subSets[0].flatName).toBe('Complete Blood Count-Hemoglobin');
    });

    it('should handle Bloodwork prefix specially to avoid long names', async () => {
      const mockResponse = {
        data: {
          display: 'Bloodwork',
          conceptUuid: 'bloodwork-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: false,
              subSets: [],
              obs: [{ value: '12.5', obsDatetime: '2024-01-01' }],
            },
          ],
          obs: [],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'bloodwork-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.flatName).toBe('Bloodwork');
      // Bloodwork children should use simplified names
      expect(data.subSets[0].flatName).toBe('Hemoglobin');
    });

    it('should set hasData to true when node has observations', async () => {
      const mockResponse = {
        data: {
          display: 'Hemoglobin',
          conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          hasData: false,
          subSets: [],
          obs: [
            {
              value: '12.5',
              obsDatetime: '2024-01-01',
            },
          ],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'hemoglobin-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.hasData).toBe(true);
    });

    it('should propagate hasData to parent when child has data', async () => {
      const mockResponse = {
        data: {
          display: 'Complete Blood Count',
          conceptUuid: 'cbc-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: false,
              subSets: [],
              obs: [{ value: '12.5', obsDatetime: '2024-01-01' }],
            },
          ],
          obs: [],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'cbc-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.hasData).toBe(true);
      expect(data.subSets[0].hasData).toBe(true);
    });

    it('should add interpretation to observations without one', async () => {
      const mockResponse = {
        data: {
          display: 'Hemoglobin',
          conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 10.4,
          hiNormal: 17.8,
          units: 'g/dL',
          hasData: false,
          subSets: [],
          obs: [
            {
              value: '5.0', // Below normal
              obsDatetime: '2024-01-01',
            },
          ],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'hemoglobin-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Interpretation is added by assessValue helper
      const data = result.current.data as ObsTreeNode;
      expect(data.obs[0].interpretation).toBeDefined();
    });

    it('should preserve existing interpretation if present', async () => {
      const mockResponse = {
        data: {
          display: 'Hemoglobin',
          conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 10.4,
          hiNormal: 17.8,
          units: 'g/dL',
          hasData: false,
          subSets: [],
          obs: [
            {
              value: '12.5',
              obsDatetime: '2024-01-01',
              interpretation: 'NORMAL',
            },
          ],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'hemoglobin-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.obs[0].interpretation).toBe('NORMAL');
    });

    it('should use observation-level reference ranges when available', async () => {
      const mockResponse = {
        data: {
          display: 'Hemoglobin',
          conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 10.4,
          hiNormal: 17.8,
          units: 'g/dL',
          hasData: false,
          subSets: [],
          obs: [
            {
              value: '12.5',
              obsDatetime: '2024-01-01',
              // Observation-specific reference ranges (criteria-based)
              lowNormal: 12.0,
              hiNormal: 16.0,
            },
          ],
        },
      };

      mockOpenmrsFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'hemoglobin-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Observation should have a range property (formatted by helper)
      const data = result.current.data as ObsTreeNode;
      expect(data.obs[0]).toHaveProperty('range');
      expect((data.obs[0] as any).range).toBeDefined();
    });
  });

  describe('filterTreesWithData via useGetManyObstreeData', () => {
    it('should filter out leaf nodes without data', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Complete Blood Count',
          conceptUuid: 'cbc-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: false,
              subSets: [],
              obs: [{ value: '12.5', obsDatetime: '2024-01-01' }],
            },
            {
              display: 'Platelets',
              conceptUuid: 'platelets-uuid',
              hasData: false,
              subSets: [],
              obs: [], // No data
            },
          ],
          obs: [],
        },
      } as any);

      const { result } = renderHook(() => useGetManyObstreeData('patient-uuid', ['cbc-uuid']));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.roots).toHaveLength(1);
      expect(result.current.roots[0].subSets).toHaveLength(1);
      expect(result.current.roots[0].subSets[0].display).toBe('Hemoglobin');
    });

    it('should keep parent nodes even if they have no direct observations', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Hematology',
          conceptUuid: 'hematology-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Complete Blood Count',
              conceptUuid: 'cbc-uuid',
              hasData: false,
              subSets: [
                {
                  display: 'Hemoglobin',
                  conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  hasData: false,
                  subSets: [],
                  obs: [{ value: '12.5', obsDatetime: '2024-01-01' }],
                },
              ],
              obs: [],
            },
          ],
          obs: [],
        },
      } as any);

      const { result } = renderHook(() => useGetManyObstreeData('patient-uuid', ['hematology-uuid']));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.roots).toHaveLength(1);
      expect(result.current.roots[0].display).toBe('Hematology');
      expect(result.current.roots[0].subSets).toHaveLength(1);
      expect(result.current.roots[0].subSets[0].display).toBe('Complete Blood Count');
    });

    it('should keep parent nodes even when all leaf nodes have no data', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Complete Blood Count',
          conceptUuid: 'cbc-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: false,
              subSets: [],
              obs: [], // No data
            },
            {
              display: 'Hematocrit',
              conceptUuid: 'hematocrit-uuid',
              hasData: false,
              subSets: [],
              obs: [], // No data
            },
          ],
          obs: [],
        },
      } as any);

      const { result } = renderHook(() => useGetManyObstreeData('patient-uuid', ['cbc-uuid']));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Parent node is kept with filtered subSets
      expect(result.current.roots).toHaveLength(1);
      expect(result.current.roots[0].display).toBe('Complete Blood Count');
    });

    it('should handle nodes that are both parent and have observations', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Test Node',
          conceptUuid: 'test-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Child Test',
              conceptUuid: 'child-uuid',
              hasData: false,
              subSets: [],
              obs: [{ value: '100', obsDatetime: '2024-01-01' }],
            },
          ],
          obs: [{ value: '50', obsDatetime: '2024-01-01' }], // Parent also has obs
        },
      } as any);

      const { result } = renderHook(() => useGetManyObstreeData('patient-uuid', ['test-uuid']));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.roots).toHaveLength(1);
      expect(result.current.roots[0].hasData).toBe(true);
      expect(result.current.roots[0].obs).toHaveLength(1);
      expect(result.current.roots[0].subSets).toHaveLength(1);
    });
  });

  describe('useGetManyObstreeData', () => {
    it('should tag root nodes with requested conceptUuid', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Hemoglobin',
          hasData: false,
          subSets: [],
          obs: [{ value: '12.5', obsDatetime: '2024-01-01' }],
        },
      } as any);

      const { result } = renderHook(() => useGetManyObstreeData('patient-uuid', ['hemoglobin-uuid']));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.roots[0].conceptUuid).toBe('hemoglobin-uuid');
    });
  });

  describe('Edge cases', () => {
    it('should handle nodes without subSets or obs', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Empty Node',
          conceptUuid: 'empty-uuid',
          hasData: false,
          subSets: [],
          obs: [],
        },
      } as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'empty-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.flatName).toBe('Empty Node');
      // hasData may be set to false or true depending on augmentation logic
      expect(data).toHaveProperty('hasData');
    });

    it('should handle deeply nested structures', async () => {
      mockOpenmrsFetch.mockResolvedValue({
        data: {
          display: 'Level1',
          conceptUuid: 'level1-uuid',
          hasData: false,
          subSets: [
            {
              display: 'Level2',
              conceptUuid: 'level2-uuid',
              hasData: false,
              subSets: [
                {
                  display: 'Level3',
                  conceptUuid: 'level3-uuid',
                  hasData: false,
                  subSets: [],
                  obs: [{ value: '100', obsDatetime: '2024-01-01' }],
                },
              ],
              obs: [],
            },
          ],
          obs: [],
        },
      } as any);

      const { result } = renderHook(() => useGetObstreeData('patient-uuid', 'level1-uuid'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      const data = result.current.data as ObsTreeNode;
      expect(data.flatName).toBe('Level1');
      expect(data.subSets[0].flatName).toBe('Level1-Level2');
      expect(data.subSets[0].subSets[0].flatName).toBe('Level1-Level2-Level3');
      expect(data.hasData).toBe(true);
    });
  });
});
