import { fhir } from '@openmrs/esm-framework';

/**
 *This function retrieves a fhir.Patient object given the UUID
 *
 * @param uUid is the patient UUID
 * @returns A FHIR object of type fhir.Patient
 */
export async function getObjectFHIR(uUid) {
   return (await fhir.read<fhir.Patient>({ type: 'Patient', patient: uUid })).data;
}