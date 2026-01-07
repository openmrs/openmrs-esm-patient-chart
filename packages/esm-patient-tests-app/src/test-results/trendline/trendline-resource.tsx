import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, showSnackbar, restBaseUrl } from '@openmrs/esm-framework';
import { assessValue } from '../loadPatientTestData/helpers';
import { type TreeNode } from '../filter/filter-types';
import {
  selectReferenceRange,
  formatReferenceRange,
  type ReferenceRanges,
} from '../grouped-timeline/reference-range-helpers';

function computeTrendlineData(treeNode: TreeNode): Array<TreeNode> {
  const tests: Array<TreeNode> = [];
  if (!treeNode) {
    return tests;
  }
  treeNode?.subSets.forEach((subNode) => {
    if ((subNode as TreeNode)?.obs) {
      const subTreeNode = subNode as TreeNode;
      // Node-level reference ranges for trendline (aggregate view)
      const nodeRanges: ReferenceRanges = {
        hiAbsolute: subTreeNode.hiAbsolute,
        hiCritical: subTreeNode.hiCritical,
        hiNormal: subTreeNode.hiNormal,
        lowAbsolute: subTreeNode.lowAbsolute,
        lowCritical: subTreeNode.lowCritical,
        lowNormal: subTreeNode.lowNormal,
        units: subTreeNode.units,
      };

      const obsWithRange = subTreeNode.obs.find((ob) => ob.lowNormal !== undefined || ob.hiNormal !== undefined);
      const observationRanges: ReferenceRanges | undefined = obsWithRange
        ? {
            hiAbsolute: obsWithRange.hiAbsolute,
            hiCritical: obsWithRange.hiCritical,
            hiNormal: obsWithRange.hiNormal,
            lowAbsolute: obsWithRange.lowAbsolute,
            lowCritical: obsWithRange.lowCritical,
            lowNormal: obsWithRange.lowNormal,
          }
        : undefined;
      const selectedRanges = selectReferenceRange(observationRanges, nodeRanges);
      const range = formatReferenceRange(selectedRanges ?? nodeRanges, subTreeNode.units);

      const processedObs = subTreeNode.obs.map((ob) => {
        // Note: Units are only at the concept/node level, not observation-level
        const observationRanges: ReferenceRanges | undefined =
          ob.lowNormal !== undefined || ob.hiNormal !== undefined
            ? {
                hiAbsolute: ob.hiAbsolute,
                hiCritical: ob.hiCritical,
                hiNormal: ob.hiNormal,
                lowAbsolute: ob.lowAbsolute,
                lowCritical: ob.lowCritical,
                lowNormal: ob.lowNormal,
              }
            : undefined;

        const selectedRanges = selectReferenceRange(observationRanges, nodeRanges);
        const assess = selectedRanges ? assessValue(selectedRanges) : assessValue(nodeRanges);
        const interpretation = ob.interpretation ?? assess(ob.value);

        return {
          ...ob,
          interpretation,
          lowNormal: ob.lowNormal,
          hiNormal: ob.hiNormal,
        };
      });

      tests.push({
        ...subTreeNode,
        range,
        obs: processedObs,
      });
    } else if (subNode?.subSets) {
      const subTreesTests = computeTrendlineData(subNode as TreeNode); // recursion
      tests.push(...subTreesTests);
    }
  });
  return tests;
}

export function useObstreeData(
  patientUuid: string,
  conceptUuid: string,
): {
  isLoading: boolean;
  trendlineData: TreeNode;
  isValidating: boolean;
} {
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<TreeNode>, Error>(
    `${restBaseUrl}/obstree?patient=${patientUuid}&concept=${conceptUuid}`,
    openmrsFetch,
  );
  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
      isLowContrast: false,
    });
  }

  const returnValue = useMemo(
    () => ({
      isLoading,
      trendlineData:
        computeTrendlineData(data?.data)?.[0] ??
        ({
          obs: [],
          display: '',
          hiNormal: 0,
          lowNormal: 0,
          units: '',
          range: '',
        } as TreeNode),
      isValidating,
    }),
    [data?.data, isLoading, isValidating],
  );

  return returnValue;
}
