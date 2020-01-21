import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take, filter } from "rxjs/operators";

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
    `/ws/rest/v1/order?patient=${patientID}&v=custom:(uuid,orderNumber,accessionNumber,patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,orderType:ref,encounter:ref,orderer:ref,orderReason,orderType,urgency,instructions,commentToFulfiller,drug:(name,strength),dose,doseUnits:ref,frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)`
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
