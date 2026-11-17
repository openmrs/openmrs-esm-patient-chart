import { usePatient } from '@openmrs/esm-framework';

export function hasPatientBannerData(patient?: fhir.Patient) {
  return Boolean(patient?.name?.length && patient?.identifier?.length);
}

/**
 * Resolves a patient with the data needed by the patient header. Some callers pass a partial
 * patient or a REST representation, so fetch the FHIR patient when the supplied patient cannot
 * populate the banner. No request is made when the supplied patient already has what the banner
 * needs.
 */
export function usePatientForBanner(patient?: fhir.Patient, patientUuid?: string) {
  const uuid = patientUuid ?? patient?.id;
  const shouldFetch = Boolean(uuid) && !hasPatientBannerData(patient);
  const { patient: fetchedPatient } = usePatient(shouldFetch ? uuid : '');

  return hasPatientBannerData(patient) ? patient : fetchedPatient ?? patient;
}
