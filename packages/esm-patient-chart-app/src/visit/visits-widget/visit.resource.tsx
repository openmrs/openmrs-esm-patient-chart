import { openmrsObservableFetch, FetchResponse, OpenmrsResource, Visit } from '@openmrs/esm-framework';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
      'form:(uuid,name),orders:(uuid,dateActivated,' +
      'drug:(uuid,name,strength),doseUnits:(uuid,display),' +
      'dose,route:(uuid,display),frequency:(uuid,display),' +
      'duration,durationUnits:(uuid,display),numRefills,' +
      'orderer:(uuid,person:(uuid,display))),location:ref,' +
      'encounterType:ref,encounterProviders:(uuid,display,' +
      'provider:(uuid,display))),patient:(uuid,uuid),' +
      'visitType:(uuid,name,display),attributes:(uuid,display,value),location:(uuid,name,display),startDatetime,' +
      'stopDatetime)';

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
