import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { PatientMedicationFetchResponse } from '../types/order';
import { careSettingUuid } from '../constants';

/**
 * Fetches the orders belonging of a patient and optional provides a way to trigger a re-fetch of
 * that data on demand.
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status The status/the kind of orders to be fetched.
 */
export function usePatientOrders(patientUuid: string, status: 'ACTIVE' | 'any') {
  const customRepresentation =
    'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
    'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
    'orderType:ref,encounter:ref,orderer:ref,orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
    'commentToFulfiller,drug:(uuid,name,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
    'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
    'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

  const { data, error, isValidating } = useSWR<{ data: PatientMedicationFetchResponse }, Error>(
    `/ws/rest/v1/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const drugOrders = data?.data?.results
    ? data.data.results.filter((order) => order.orderType.display === 'Drug Order')
    : null;

  return {
    data: data ? drugOrders : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
