import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type TreeNode } from '../filter/filter-types';
import { computeTrendlineData } from './trendline-resource';

describe('computeTrendlineData', () => {
  it('propagates observation-level reference ranges to the returned node', () => {
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
              lowNormal: 12,
              hiNormal: 16,
            },
          ],
        },
      ],
    } as TreeNode;

    const [node] = computeTrendlineData(tree);

    expect(node.range).toBe('12 – 16 g/dL');
    expect(node.lowNormal).toBe(12);
    expect(node.hiNormal).toBe(16);
  });
});
