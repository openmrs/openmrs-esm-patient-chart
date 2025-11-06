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

      // Format node-level range for display
      const range = formatReferenceRange(nodeRanges, subTreeNode.units);

      // Process observations: use observation-level ranges for interpretation if available
      const processedObs = subTreeNode.obs.map((ob) => {
        // Extract observation-level reference ranges if present
        const observationRanges: ReferenceRanges | undefined =
          ob.lowNormal !== undefined || ob.hiNormal !== undefined
            ? {
                hiAbsolute: ob.hiAbsolute,
                hiCritical: ob.hiCritical,
                hiNormal: ob.hiNormal,
                lowAbsolute: ob.lowAbsolute,
                lowCritical: ob.lowCritical,
                lowNormal: ob.lowNormal,
                units: ob.units,
              }
            : undefined;

        // Select ranges: observation-level takes precedence
        const selectedRanges = selectReferenceRange(observationRanges, nodeRanges);

        // Calculate interpretation using selected ranges
        const assess = selectedRanges ? assessValue(selectedRanges) : assessValue(nodeRanges);
        const interpretation = ob.interpretation ?? assess(ob.value);

        return {
          ...ob,
          interpretation,
          // Preserve range fields for potential future use (e.g., getMostRecentObservationWithRange)
          lowNormal: ob.lowNormal,
          hiNormal: ob.hiNormal,
          units: ob.units,
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
