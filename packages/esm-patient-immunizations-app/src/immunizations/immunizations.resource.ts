import { openmrsFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { type FHIRImmunizationResource } from '../types/fhir-immunization-domain';

export function savePatientImmunization(
  patientImmunization: FHIRImmunizationResource,
  immunizationObsUuid: string,
  abortController: AbortController,
) {
  let immunizationEndpoint = `${fhirBaseUrl}/Immunization`;
  if (immunizationObsUuid) {
    immunizationEndpoint = `${immunizationEndpoint}/${immunizationObsUuid}`;
  }
  return openmrsFetch(immunizationEndpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: immunizationObsUuid ? 'PUT' : 'POST',
    body: patientImmunization,
    signal: abortController.signal,
  });
}
