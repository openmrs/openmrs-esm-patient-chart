import { type Order } from '@openmrs/esm-patient-common-lib';

export interface PatientMedicationFetchResponse {
  results: Array<Order>;
}

export interface OrderDiscontinuationPayload {
  previousOrder: string;
  type: string;
  action: string;
  careSetting: string;
  encounter: string;
  patient: string;
  concept: string;
  orderer: { display: string; person: { display: string }; uuid: string };
}
