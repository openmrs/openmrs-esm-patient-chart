import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, showSnackbar, restBaseUrl } from '@openmrs/esm-framework';
import { assessValue } from '../loadPatientTestData/helpers';
import { type TreeNode } from '../filter/filter-types';
import { selectReferenceRange, type ReferenceRanges } from '../grouped-timeline/reference-range-helpers';

export function computeTrendlineData(treeNode: TreeNode): Array<TreeNode> {
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

      const processedObs = subTreeNode.obs.map((ob) => {
        // Note: Units are only at the concept/node level, not observation-level
        const hasObservationRanges =
          ob.lowNormal !== undefined ||
          ob.hiNormal !== undefined ||
          ob.lowCritical !== undefined ||
          ob.hiCritical !== undefined ||
          ob.lowAbsolute !== undefined ||
          ob.hiAbsolute !== undefined;
        const observationRanges: ReferenceRanges | undefined = hasObservationRanges
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
        const resolvedRanges = selectedRanges ?? nodeRanges;
        const assess = assessValue(resolvedRanges);
        const interpretation = ob.interpretation ?? assess(ob.value);

        return {
          ...ob,
          interpretation,
          lowNormal: resolvedRanges?.lowNormal,
          hiNormal: resolvedRanges?.hiNormal,
          lowCritical: resolvedRanges?.lowCritical,
          hiCritical: resolvedRanges?.hiCritical,
          lowAbsolute: resolvedRanges?.lowAbsolute,
          hiAbsolute: resolvedRanges?.hiAbsolute,
        };
      });

      tests.push({
        ...subTreeNode,
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
        } as TreeNode),
      isValidating,
    }),
    [data?.data, isLoading, isValidating],
  );

  return returnValue;
}
