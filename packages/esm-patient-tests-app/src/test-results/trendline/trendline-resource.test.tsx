import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type TreeNode } from '../filter/filter-types';
import { computeTrendlineData } from './trendline-resource';

describe('computeTrendlineData', () => {
  it('resolves observation-level reference ranges for each observation', () => {
    const tree: TreeNode = {
      display: 'Root',
      flatName: 'Root',
      subSets: [
        {
          display: 'Hemoglobin',
          flatName: 'Hemoglobin',
          units: 'g/dL',
          hiNormal: 9,
          lowNormal: 5,
          obs: [
            {
              obsDatetime: '2022-05-01T00:00:00.000Z',
              value: '8',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
              lowNormal: 10,
              hiNormal: 12,
            },
            {
              obsDatetime: '2023-05-01T00:00:00.000Z',
              value: '9',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
              lowNormal: 14,
              hiNormal: 18,
            },
          ],
        },
      ],
    } as TreeNode;

    const [node] = computeTrendlineData(tree);

    // Each observation should have its own resolved reference range
    expect(node.obs[0].lowNormal).toBe(10);
    expect(node.obs[0].hiNormal).toBe(12);
    expect(node.obs[1].lowNormal).toBe(14);
    expect(node.obs[1].hiNormal).toBe(18);
  });

  it('falls back to concept-level ranges when observation has no range', () => {
    const tree: TreeNode = {
      display: 'Root',
      flatName: 'Root',
      subSets: [
        {
          display: 'Hemoglobin',
          flatName: 'Hemoglobin',
          units: 'g/dL',
          hiNormal: 9,
          lowNormal: 5,
          obs: [
            {
              obsDatetime: '2022-05-01T00:00:00.000Z',
              value: '8',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
              // No observation-level range
            },
          ],
        },
      ],
    } as TreeNode;

    const [node] = computeTrendlineData(tree);

    // Should fall back to concept-level ranges
    expect(node.obs[0].lowNormal).toBe(5);
    expect(node.obs[0].hiNormal).toBe(9);
  });

  it('uses observation-level critical ranges even when normal ranges are missing', () => {
    const tree: TreeNode = {
      display: 'Root',
      flatName: 'Root',
      subSets: [
        {
          display: 'Hemoglobin',
          flatName: 'Hemoglobin',
          units: 'g/dL',
          hiNormal: 9,
          lowNormal: 5,
          obs: [
            {
              obsDatetime: '2022-05-01T00:00:00.000Z',
              value: '201',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
              lowCritical: 2,
              hiCritical: 200,
            },
          ],
        },
      ],
    } as TreeNode;

    const [node] = computeTrendlineData(tree);

    expect(node.obs[0].lowCritical).toBe(2);
    expect(node.obs[0].hiCritical).toBe(200);
  });
});
