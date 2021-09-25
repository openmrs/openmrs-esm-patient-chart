import { openmrsFetch } from '@openmrs/esm-framework';
import { careSettingUuid } from '../constants';
import { Order, OrderPost } from '../types/order';

const durationUnitsConcept = '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export interface PatientMedicationFetchResponse {
  results: Array<Order>;
}

export function getPatientEncounterId(patientUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/encounter?patient=${patientUuid}&order=desc&limit=1&v=custom:(uuid)`, {
    signal: abortController.signal,
  });
}

export function getDrugByName(drugName: string, abortController?: AbortController) {
  return openmrsFetch(
    `/ws/rest/v1/drug?q=${drugName}&v=custom:(uuid,name,strength,dosageForm:(display,uuid),concept)`,
    {
      signal: abortController?.signal,
    },
  );
}

export function getDurationUnits(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/concept/${durationUnitsConcept}?v=custom:(answers:(uuid,display))`, abortController);
}

export function getMedicationByUuid(abortController: AbortController, orderUuid: string) {
  return openmrsFetch(
    `/ws/rest/v1/order/${orderUuid}?v=custom:(uuid,route:(uuid,display),action,urgency,display,drug:(display,strength),frequency:(display),dose,doseUnits:(display),orderer,dateStopped,dateActivated,previousOrder,numRefills,duration,durationUnits:(display),dosingInstructions)`,
    {
      signal: abortController.signal,
    },
  );
}

export function postOrder(body: OrderPost, abortController?: AbortController) {
  return openmrsFetch(`/ws/rest/v1/order`, {
    method: 'POST',
    signal: abortController?.signal,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export async function fetchPatientOrders(
  patientUuid: string,
  status: 'ACTIVE' | 'any',
  abortController?: AbortController,
) {
  const { data } = await openmrsFetch<PatientMedicationFetchResponse>(
    `/ws/rest/v1/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&v=custom:(uuid,dosingType,orderNumber,accessionNumber,patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,orderType:ref,encounter:ref,orderer:ref,orderReason,orderReasonNonCoded,orderType,urgency,instructions,commentToFulfiller,drug:(uuid,name,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)`,
    { signal: abortController?.signal },
  );
  return data.results.filter((x) => x.orderType.display === 'Drug Order');
}
