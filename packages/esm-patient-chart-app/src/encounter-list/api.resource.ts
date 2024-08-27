import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function fetchPatientRelationships(patientUuid: string) {
  return openmrsFetch(`${restBaseUrl}/relationship?person=${patientUuid}&v=full`).then(({ data }) => {
    if (data.results.length) {
      return data.results;
    }
    return null;
  });
}
