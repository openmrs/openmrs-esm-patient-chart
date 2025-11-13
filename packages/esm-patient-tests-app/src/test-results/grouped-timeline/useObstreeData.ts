import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { assessValue, exist } from '../loadPatientTestData/helpers';
import { selectReferenceRange, formatReferenceRange, type ReferenceRanges } from './reference-range-helpers';

export const getName = (prefix: string | undefined, name: string) => {
  return prefix ? `${prefix}-${name}` : name;
};

interface ObsTreeNode {
  flatName?: string;
  display: string;
  hasData: boolean;
  hiAbsolute?: number;
  hiCritical?: number;
  hiNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  lowNormal?: number;
  units?: string;
  range?: string;
  subSets: Array<ObsTreeNode>;
  obs: Array<{
    value: string;
    interpretation?: OBSERVATION_INTERPRETATION;
    obsDatetime?: string;
    // Observation-level reference ranges (criteria-based)
    // Note: Units are only at the concept/node level, not observation-level
    hiAbsolute?: number;
    hiCritical?: number;
    hiNormal?: number;
    lowAbsolute?: number;
    lowCritical?: number;
    lowNormal?: number;
  }>;
}

const augmentObstreeData = (node: ObsTreeNode, prefix: string | undefined) => {
  const outData: Partial<ObsTreeNode> = JSON.parse(JSON.stringify(node));

  // Build flatName with hierarchy but ensure we don't lose any tests
  if (prefix && prefix !== 'Bloodwork') {
    outData.flatName = `${prefix.trim()}-${node.display.trim()}`;
  } else if (prefix === 'Bloodwork') {
    // For Bloodwork, use the simplified name to avoid duplicates
    // but ensure the test is still accessible
    outData.flatName = node.display.trim();
  } else {
    outData.flatName = node.display.trim();
  }

  outData.hasData = false;

  if (outData?.subSets?.length) {
    outData.subSets = outData.subSets.map((subNode: ObsTreeNode) => augmentObstreeData(subNode, outData.flatName));
    outData.hasData = outData.subSets.some((subNode: ObsTreeNode) => subNode.hasData);
  }
  // Format node-level range for display (using lowNormal/hiNormal)
  if (exist(outData?.hiNormal, outData?.lowNormal)) {
    outData.range = formatReferenceRange(
      {
        lowNormal: outData.lowNormal,
        hiNormal: outData.hiNormal,
        units: outData.units,
      },
      outData.units,
    );
  }

  if (outData?.obs?.length) {
    outData.obs = outData.obs.map((ob) => {
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

      const nodeRanges: ReferenceRanges | undefined = {
        hiAbsolute: outData.hiAbsolute,
        hiCritical: outData.hiCritical,
        hiNormal: outData.hiNormal,
        lowAbsolute: outData.lowAbsolute,
        lowCritical: outData.lowCritical,
        lowNormal: outData.lowNormal,
        units: outData.units,
      };

      const selectedRanges = selectReferenceRange(observationRanges, nodeRanges);
      const assess = selectedRanges ? assessValue(selectedRanges) : assessValue(nodeRanges);
      const interpretation = ob.interpretation ?? assess(ob.value);

      // Always use node-level units since observation-level ranges don't have units
      const displayRange = observationRanges
        ? formatReferenceRange(observationRanges, outData.units)
        : outData.range || '--';

      return {
        ...ob,
        interpretation,
        range: displayRange,
      };
    });
    outData.hasData = true;
  }

  return { ...outData } as ObsTreeNode;
};

const useGetObstreeData = (patientUuid: string, conceptUuid: string) => {
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

const useGetManyObstreeData = (patientUuid: string, uuidArray: Array<string>) => {
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

  return { roots, isLoading, error };
};

export default useGetManyObstreeData;
export { useGetManyObstreeData, useGetObstreeData };
