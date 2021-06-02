import { openmrsObservableFetch, FetchResponse, OpenmrsResource, Visit } from '@openmrs/esm-framework';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Observation {
  uuid: string;
  display: string;
  links: Array<any>;
}

export interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  route: {
    uuid: string;
    display: string;
  };
}

export function fetchEncounterObservations(encounterUuid) {
  return openmrsObservableFetch(`/ws/rest/v1/encounter/${encounterUuid}`)
    .pipe(take(1))
    .pipe(map((res: FetchResponse<OpenmrsResource>) => res.data));
}

export function getVisitsForPatient(
  patientUuid: string,
  abortController: AbortController,
  v?: string,
): Observable<FetchResponse<{ results: Array<Visit> }>> {
  const custom =
    v ||
    'custom:(uuid,encounters:(uuid,encounterDatetime,' +
      'orders:(uuid,dateActivated,' +
      'drug:(uuid,name,strength),doseUnits:(uuid,display),' +
      'dose,route:(uuid,display),frequency:(uuid,display),' +
      'duration,durationUnits:(uuid,display),numRefills,' +
      'orderer:(uuid,person:(uuid,display))),obs,' +
      'encounterType:ref,encounterProviders:(uuid,display,' +
      'provider:(uuid,display))),' +
      'visitType:(uuid,name,display),startDatetime';

  return openmrsObservableFetch(`/ws/rest/v1/visit?patient=${patientUuid}&v=${custom}`, {
    signal: abortController.signal,
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  })
    .pipe(take(1))
    .pipe(
      map((response: FetchResponse<{ results: Array<Visit> }>) => {
        return response;
      }),
    );
}

export function getDosage(strength, doseNumber) {
  if (!strength || !doseNumber) {
    return '';
  }

  const i = strength.search(/\D/);
  const strengthQuantity = strength.substring(0, i);

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);
  let dosage;

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = strength.substr(concentrationStartIndex + 1, j);
    const concentrationUnits = strength.substring(concentrationStartIndex + 1 + j);
    dosage = `${doseNumber} ${strengthUnits} (${
      (doseNumber / strengthQuantity) * concentrationQuantity
    } ${concentrationUnits})`;
  } else {
    dosage = strengthQuantity * doseNumber + ' ' + strengthUnits;
  }
  return dosage;
}
