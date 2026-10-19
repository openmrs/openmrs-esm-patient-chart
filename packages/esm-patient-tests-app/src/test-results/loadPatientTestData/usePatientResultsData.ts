import { useEffect, useState } from 'react';
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
  useEffect(() => {
    // Scoped to this patient request, so an earlier request cannot update a later patient's chart.
    let active = true;
    if (patientUuid) {
      const [data, reloadedDataPromise] = loadPatientData(patientUuid);
      // Reset previous patient data immediately, even when the new patient has no cache.
      setState({ sortedObs: data ?? {}, loaded: Boolean(data), error: undefined });
      reloadedDataPromise
        .then((reloadedData) => {
          if (reloadedData !== data && active) {
            setState({ sortedObs: reloadedData, loaded: true, error: undefined });
          }
        })
        .catch((error) => {
          if (active) {
            setState({ sortedObs: data ?? {}, loaded: true, error });
          }
        });
    } else {
      setState({ sortedObs: {}, loaded: false, error: undefined });
    }
    return () => {
      active = false;
    };
  }, [patientUuid]);

  return state;
};

export default usePatientResultsData;
