import { useEffect, useState, useRef } from 'react';
import { type PatientData } from '@openmrs/esm-patient-common-lib';
import loadPatientData from './loadPatientData';

type LoadingState = {
  sortedObs: PatientData;
  loaded: boolean;
  error: object | undefined;
};

const usePatientResultsData = (patientUuid: string): LoadingState => {
  const [state, setState] = useState<LoadingState>({
    sortedObs: {},
    loaded: false,
    error: undefined,
  });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (patientUuid) {
      const [data, reloadedDataPromise] = loadPatientData(patientUuid);
      if (!!data && isMountedRef.current) {
        setState({ sortedObs: data, loaded: true, error: undefined });
      }
      reloadedDataPromise
        .then((reloadedData) => {
          if (reloadedData !== data && isMountedRef.current) {
            setState({ sortedObs: reloadedData, loaded: true, error: undefined });
          }
        })
        .catch((error) => {
          if (isMountedRef.current) {
            setState({ sortedObs: {}, loaded: true, error });
          }
        });
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [patientUuid]);

  return state;
};

export default usePatientResultsData;
