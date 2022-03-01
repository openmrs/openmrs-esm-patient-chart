import { usePatient, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { assessValue, exist } from '../loadPatientTestData/helpers';

export const getName = (prefix, name) => {
  return prefix ? `${prefix}-${name}` : name;
};

const augmentObstreeData = (node, prefix) => {
  const outData = JSON.parse(JSON.stringify(node));
  outData.flatName = getName(prefix, node.display);
  if (outData?.subSets?.length) {
    outData.subSets = outData.subSets.map((subNode) => augmentObstreeData(subNode, getName(prefix, node?.display)));
  }
  if (exist(outData?.hiNormal, outData?.lowNormal)) {
    outData.range = `${outData.lowNormal} – ${outData.hiNormal}`;
  }
  if (outData?.obs?.length) {
    const assess = assessValue(outData);
    outData.obs = outData.obs.map((ob) => ({ ...ob, interpretation: assess(ob.value) }));
    outData.hasData = true;
  } else {
    outData.hasData = false;
  }
  return { ...outData };
};

const useGetObstreeData = (conceptUuid) => {
  const { patientUuid } = usePatient();
  const response = useSWR(`/ws/rest/v1/obstree?patient=${patientUuid}&concept=${conceptUuid}`, openmrsFetch);
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

export default useGetObstreeData;
