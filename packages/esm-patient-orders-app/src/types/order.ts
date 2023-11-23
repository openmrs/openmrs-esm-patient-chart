import { type Order } from '@openmrs/esm-patient-common-lib';

export interface PatientMedicationFetchResponse {
  results: Array<Order>;
}
