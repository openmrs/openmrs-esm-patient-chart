import { usePatient, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { assessValue, exist } from '../loadPatientTestData/helpers';

const augmentObstreeData = (node) => {
  const outData = JSON.parse(JSON.stringify(node));
  if (outData?.subSets?.length) {
    outData.subSets = outData.subSets.map((subNode) => augmentObstreeData(subNode));
  }
  if (exist(outData?.hiNormal, outData?.lowNormal)) {
    outData.range = `${outData.lowNormal} – ${outData.hiNormal}`;
  }
  if (outData?.obs?.length) {
    const assess = assessValue(outData);
    outData.obs = outData.obs.map((ob) => ({ ...ob, interpretation: assess(ob.value) }));
  }
  return { ...outData };
};

const useGetObstreeData = (conceptUuid) => {
  const { patientUuid } = usePatient();
  const response = useSWR(`/ws/rest/v1/obstree?patient=${patientUuid}&concept=${conceptUuid}`, openmrsFetch);
  const result = useMemo(() => {
    if (response.data) {
      const { data, ...rest } = response;
      const newData = augmentObstreeData(data?.data);
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
