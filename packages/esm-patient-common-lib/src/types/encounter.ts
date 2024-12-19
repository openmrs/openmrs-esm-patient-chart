import { type OpenmrsResource, type Visit } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';

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
  visit?: Visit;
  obs: Array<Observation>;
  orders: Array<Order>;
  diagnoses: Array<Diagnosis>;
  patient: OpenmrsResource;
  location: OpenmrsResource;
}

export interface Observation {
  uuid: string;
  display: string;
  concept: {
    uuid: string;
    display: string;
  };
  obsGroup: any;
  obsDatetime: string;
  groupMembers?: Array<Observation>;
  value: {
    uuid: string;
    display: string;
  };
  location: OpenmrsResource;
  order: Order;
  status: string;
}

export interface Diagnosis {
  uuid: string;
  display: string;
  diagnosis: {
    coded?: {
      uuid: string;
      display?: string;
    };
    nonCoded?: string;
  };
  certainty: string;
  rank: number;
}
