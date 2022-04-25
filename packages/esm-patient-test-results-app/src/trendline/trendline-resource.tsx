import useSWR from 'swr';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { assessValue } from '../loadPatientTestData/helpers';
import { useMemo } from 'react';
import { FetchResponse, openmrsFetch, showNotification } from '@openmrs/esm-framework';
import { TestData } from '../filter/filter-types';

interface TreeNode {
  display: string;
  subSets: Array<TreeNode | TestData>;
}

function computeTrendlineData(treeNode: TreeNode): Array<TestData> {
  const tests: Array<TestData> = [];
  if (!treeNode) {
    return tests;
  }
  treeNode?.subSets.forEach((subNode) => {
    if ((subNode as TestData)?.obs) {
      const testData = subNode as TestData;
      const assess = assessValue(testData.obs);
      tests.push({
        ...testData,
        range: testData.hiNormal && testData.lowNormal ? `${testData.lowNormal} - ${testData.hiNormal}` : '',
        obs: testData.obs.map((ob) => ({ ...ob, interpretation: assess(ob.value) })),
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
  trendlineData: TestData;
  isValidating: boolean;
} {
  const { data, error, isValidating } = useSWR<FetchResponse<TreeNode>, Error>(
    `/ws/rest/v1/obstree?patient=${patientUuid}&concept=${conceptUuid}`,
    openmrsFetch,
  );
  if (error) {
    showNotification({
      title: error.name,
      description: error.message,
      kind: 'error',
    });
  }

  const returnValue = useMemo(
    () => ({
      isLoading: !data && !error,
      trendlineData:
        computeTrendlineData(data?.data)?.[0] ??
        ({
          obs: [],
          display: '',
          hiNormal: 0,
          lowNormal: 0,
          units: '',
          range: '',
        } as TestData),
      isValidating,
    }),
    [data, error, isValidating],
  );

  return returnValue;
}
