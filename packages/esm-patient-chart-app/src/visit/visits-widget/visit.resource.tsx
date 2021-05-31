import {
  openmrsObservableFetch,
  fhirBaseUrl,
  openmrsFetch,
  FetchResponse,
  OpenmrsResource,
} from '@openmrs/esm-framework';
import { take, map } from 'rxjs/operators';

export function fetchEncounterObservations(encounterUuid) {
  return openmrsObservableFetch(`/ws/rest/v1/encounter/${encounterUuid}`)
    .pipe(take(1))
    .pipe(map((res: FetchResponse<OpenmrsResource>) => res.data));
}
