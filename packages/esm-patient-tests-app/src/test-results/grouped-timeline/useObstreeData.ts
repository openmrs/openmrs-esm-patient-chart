import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { assessValue, exist } from '../loadPatientTestData/helpers';

export const getName = (prefix: string | undefined, name: string) => {
  return prefix ? `${prefix}-${name}` : name;
};

export const getDisplayFromFlatName = (flatName: string) => {
  return flatName.split('-').pop();
};

interface ObsTreeNode {
  flatName?: string;
  display: string;
  hasData: boolean;
  hiNormal?: number;
  lowNormal?: number;
  range?: string;
  subSets: Array<ObsTreeNode>;
  obs: Array<{ value: string }>;
}

const augmentObstreeData = (node: ObsTreeNode, prefix: string | undefined) => {
  const outData: Partial<ObsTreeNode> = JSON.parse(JSON.stringify(node));
  outData.flatName = getName(prefix, node.display);
  outData.hasData = false;

  if (outData?.subSets?.length) {
    outData.subSets = outData.subSets.map((subNode: ObsTreeNode) =>
      augmentObstreeData(subNode, getName(prefix, node?.display)),
    );
    outData.hasData = outData.subSets.some((subNode: ObsTreeNode) => subNode.hasData);
  }
  if (exist(outData?.hiNormal, outData?.lowNormal)) {
    outData.range = `${outData.lowNormal} – ${outData.hiNormal}`;
  }
  if (outData?.obs?.length) {
    const assess = assessValue(outData);
    outData.obs = outData.obs.map((ob) => ({ ...ob, interpretation: assess(ob.value) }));
    outData.hasData = true;
  }

  return { ...outData } as ObsTreeNode;
};

const deduplicateObsData = (data: Array<ObsTreeNode>) => {
  const seen = new Map();
  function deduplicateNode(node: ObsTreeNode, depth = 0) {
    if (!node || typeof node !== 'object') {
      return null;
    }

    const isContainer = Array.isArray(node.subSets);
    const key = node.display;
    if (seen.has(key)) {
      const prevDepth = seen.get(key);
      if (depth >= prevDepth) {
        return null;
      }
    }
    seen.set(key, depth);
    const newSubSets = isContainer
      ? node.subSets.map((child) => deduplicateNode(child, depth + 1)).filter(Boolean)
      : node.subSets;

    return {
      ...node,
      subSets: newSubSets,
    } as ObsTreeNode;
  }
  return data.map((item) => deduplicateNode(item, 0)).filter(Boolean);
};

const useGetObstreeData = (conceptUuid: string) => {
  const { patientUuid } = usePatientChartStore();
  const response = useSWR<FetchResponse<ObsTreeNode>, Error>(
    `${restBaseUrl}/obstree?patient=${patientUuid}&concept=${conceptUuid}`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    if (response.data) {
      const { data, ...rest } = response;
      const newData = augmentObstreeData(data?.data, '');
      return { ...rest, loading: false, data: newData };
    } else {
      return {
        data: {},
        error: false,
        loading: true,
      };
    }
  }, [response]);
  return result;
};

const useGetManyObstreeData = (uuidArray: Array<string>) => {
  const { patientUuid } = usePatientChartStore();
  const getObstreeUrl = (index: number) => {
    if (index < uuidArray.length && patientUuid) {
      return `${restBaseUrl}/obstree?patient=${patientUuid}&concept=${uuidArray[index]}`;
    } else return null;
  };
  const { data, error } = useSWRInfinite(getObstreeUrl, openmrsFetch, {
    initialSize: uuidArray.length,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const result = useMemo(() => {
    return (
      data?.map((resp) => {
        if (resp?.data) {
          const { data, ...rest } = resp;
          const newData = augmentObstreeData(data, '');
          return { ...rest, loading: false, data: newData };
        } else {
          return {
            data: {},
            error: false,
            loading: true,
          };
        }
      }) || [
        {
          data: {},
          error: false,
          loading: true,
        },
      ]
    );
  }, [data]);
  const roots = result.map((item) => item.data);
  const isLoading = result.some((item) => item.loading);
  const filteredRoots = useMemo(() => {
    const allRoots: ObsTreeNode[] = roots.filter((node): node is ObsTreeNode => Object.keys(node).length > 0);
    return deduplicateObsData(allRoots);
  }, [roots]);
  return { roots, isLoading, error, filteredRoots };
};

export default useGetManyObstreeData;
export { useGetManyObstreeData, useGetObstreeData };
