export function getDosage(strength, doseNumber) {
  const i = strength.search(/\D/);
  const strengthQuantity = strength.substring(0, i);

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);
  let dosage;

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = strength.substr(
      concentrationStartIndex + 1,
      j
    );
    const concentrationUnits = strength.substring(
      concentrationStartIndex + 1 + j
    );
    dosage =
      doseNumber +
      strengthUnits +
      " (" +
      (doseNumber / strengthQuantity) * concentrationQuantity +
      concentrationUnits +
      ")";
  } else {
    dosage = strengthQuantity * doseNumber + strengthUnits;
  }
  return dosage;
}

export function setDefaultValues(commonDrugOrders) {
  let drugUnits, frequencyConcept, routeConcept, routeName, Dose: string;
  if (commonDrugOrders) {
    commonDrugOrders[0].commonFrequencies.map(frequency => {
      if (frequency.selected === true) {
        frequencyConcept = frequency.conceptUuid;
      }
    });

    commonDrugOrders[0].commonDosages.map(dose => {
      if (dose.selected === true) {
        Dose = dose.numberOfPills;
      }
    });
  }

  commonDrugOrders[0].route.map(route => {
    if (route.selected === true) {
      routeConcept = route.conceptUuid;
      routeName = route.name;
    }
  });

  return [
    {
      drugUnits: drugUnits,
      frequencyConcept: frequencyConcept,
      routeConcept: routeConcept,
      dose: Dose,
      routeName: routeName
    }
  ];
}

export type OrderMedication = {
  patientUuid: string;
  careSetting: string;
  orderer: string;
  encounterUuid: string;
  drugUuid?: string;
  drugName?: string;
  drugStrength?: string;
  dose?: Number;
  doseUnitsConcept?: string;
  dosageForm?: string;
  dosingInstructions?: string;
  route?: string;
  routeName?: string;
  frequencyUuid?: string;
  frequencyName?: string;
  asNeeded?: string;
  numRefills?: string;
  action?: string | null;
  quantity?: Number;
  quantityUnits?: string;
  type: string;
  previousOrder?: string | null;
  duration?: Number;
  durationUnits?: string;
  concept?: string;
  orderReasonNonCoded?: string;
  orderUuid: string;
  autoExpireDate?: Date;
  startDate?: string;
};
