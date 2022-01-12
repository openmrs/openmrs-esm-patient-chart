import { Form } from '@ampath-kenya/ngx-formentry';

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
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
  orders: Array<Order>;
}

interface OpenMRSResource {
  display: string;
  uuid: string;
  links?: Array<{ rel: string; uri: string }>;
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
      uuid: string;
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

export interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  orderNumber: number;
  display: string;
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
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  auditInfo: {
    dateVoided: string;
  };
}

export interface FormSchema {
  auditInfo: {
    dateCreated: string;
    dateChanged: string;
    changedBy: OpenMRSResource;
    creator: OpenMRSResource;
  };
  build: string;
  description: string;
  display: string;
  encounterType: OpenMRSResource;
  formField: Array<unknown>;
  name: string;
  pages: Array<{ label: string; sections: Sections }>;
  processor: string;
  published: boolean;
  referencedForms: Form;
  resourceVersion: string;
  retired: boolean;
  uuid: string;
  version: string;
}

interface Sections {
  isExpanded: boolean;
  label: string;
  questions: Array<Questions>;
}

interface Questions {
  default: string;
  id: string;
  questionOptions: QuestionOptions;
  required: boolean;
  type: string;
  validators: Array<Validators>;
}

interface Validators {
  type: string;
}

interface QuestionOptions {
  rendering: string;
}

export interface LoggedInUser {
  user: any;
  currentProvider: {
    uuid: string;
    display: string;
    identifier: string;
  };
  sessionLocation: {
    uuid: string;
    name: string;
    display: string;
  };
}

export interface MonthlyScheduleParams {
  endDate: string;
  limit: number;
  locationUuids: string;
  programType: string;
  startDate: string;
}
