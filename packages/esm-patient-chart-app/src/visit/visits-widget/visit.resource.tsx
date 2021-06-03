export interface Encounter {
  uuid: string;
  encounterDateTime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  orders: Array<Medication>;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export interface Medication {
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

export interface Note {
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface MedicationItem {
  order: Medication;
  provider: {
    name: string;
    role: string;
  };
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
