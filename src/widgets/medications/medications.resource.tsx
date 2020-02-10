import { openmrsObservableFetch, openmrsFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take, filter } from "rxjs/operators";
import { OrderMedication } from "./medication-orders-utils";

type PatientMedications = {
  uuid: Number;
};

export function performPatientMedicationsSearch(
  patientID: string
): Observable<PatientMedications[]> {
  return openmrsObservableFetch(
    `/ws/fhir/MedicationRequest?patient=${patientID}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries.map(entry => entry.resource)),
    take(3)
  );
}

export function fetchPatientMedications(
  patientID: string
): Observable<PatientMedications[]> {
  return openmrsObservableFetch(
    `/ws/rest/v1/order?patient=${patientID}&careSetting=6f0c9a92-6f24-11e3-af88-005056821db0&status=any&v=custom:(uuid,orderNumber,accessionNumber,patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,orderType:ref,encounter:ref,orderer:ref,orderReason,orderType,urgency,instructions,commentToFulfiller,drug:(name,strength),dose,doseUnits:ref,frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)`
  ).pipe(
    map(({ data }) => {
      const meds = [];
      data["results"].map(result => {
        if (result.orderType.name === "Drug Order") {
          meds.push(result);
        }
      });
      return meds;
    })
  );
}

export function getDrugByName(
  drugName: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/drug?q=${drugName}&v=custom:(uuid,name,strength,dosageForm:(display,uuid))`,
    {
      signal: abortController.signal
    }
  );
}

export function getPatientEncounterID(
  patientUuid: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/encounter?patient=${patientUuid}&order=desc&limit=1&v=custom:(uuid)`,
    { signal: abortController.signal }
  );
}

export function saveNewDrugOrder(
  abortContoller: AbortController,
  drugOrder: OrderMedication
) {
  if (drugOrder.previousOrder === null) {
    return openmrsFetch(`/ws/rest/v1/order`, {
      method: "POST",
      signal: abortContoller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        patient: drugOrder.patientUuid,
        careSetting: drugOrder.careSetting,
        orderer: drugOrder.orderer,
        encounter: drugOrder.encounterUuid,
        drug: drugOrder.drugUuid,
        dose: drugOrder.dose,
        doseUnits: drugOrder.doseUnitsConcept,
        route: drugOrder.route,
        frequency: drugOrder.frequencyUuid,
        asNeeded: drugOrder.asNeeded,
        numRefills: drugOrder.numRefills,
        action: drugOrder.action,
        quantity: drugOrder.quantity,
        quantityUnits: drugOrder.quantityUnits,
        type: drugOrder.type,
        duration: drugOrder.duration,
        durationUnits: drugOrder.durationUnits,
        dosingInstructions: drugOrder.dosingInstructions
      }
    });
  } else {
    return openmrsFetch(`/ws/rest/v1/order`, {
      method: "POST",
      signal: abortContoller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        patient: drugOrder.patientUuid,
        careSetting: drugOrder.careSetting,
        orderer: drugOrder.orderer,
        encounter: drugOrder.encounterUuid,
        drug: drugOrder.drugUuid,
        dose: drugOrder.dose,
        doseUnits: drugOrder.doseUnitsConcept,
        route: drugOrder.route,
        frequency: drugOrder.frequencyUuid,
        asNeeded: drugOrder.asNeeded,
        numRefills: drugOrder.numRefills,
        action: drugOrder.action,
        quantity: drugOrder.quantity,
        quantityUnits: drugOrder.quantityUnits,
        type: drugOrder.type,
        duration: drugOrder.duration,
        durationUnits: drugOrder.durationUnits,
        previousOrder: drugOrder.previousOrder,
        dosingInstructions: drugOrder.dosingInstructions
      }
    });
  }
}

export function getPatientDrugOrderDetails(
  abortController: AbortController,
  orderUuid: string
) {
  return openmrsFetch(
    `/ws/rest/v1/order/${orderUuid}?v=custom:(uuid,orderNumber,patient:(uuid),action,careSetting:(uuid),previousOrder:(uuid),dateActivated,encounter:(uuid),frequency,asNeeded,quantity,quantityUnits:(uuid,display),numRefills,dosingInstructions,duration,durationUnits:(uuid,display),route:(uuid,display),dose,doseUnits:(uuid,display))`,
    {
      signal: abortController.signal
    }
  );
}

export function getDurationUnits(abortController: AbortController) {
  return openmrsFetch(
    `/ws/rest/v1/concept/1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=custom:(answers:(uuid,display))`,
    abortController
  );
}
