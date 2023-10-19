import { OpenmrsResource } from '@openmrs/esm-framework';

export interface OrderBasketItem {
  action: 'NEW' | 'REVISE' | 'DISCONTINUE' | 'RENEW' | undefined;
  display: string;
  uuid?: string;
  orderer?: string;
  careSetting?: string;
  orderError?: Error & {
    responseBody?: {
      error?: {
        code?: string;
        detail?: string;
        message?: string;
      };
    };
  };
}

export interface OrderPost {
  action?: 'NEW' | 'REVISE' | 'DISCONTINUE';
  patient?: string;
  careSetting?: string;
  orderer?: string;
  encounter?: string;
  drug?: string;
  dose?: number;
  doseUnits?: string;
  route?: string;
  frequency?: string;
  asNeeded?: boolean;
  numRefills?: number;
  quantity?: number;
  quantityUnits?: string;
  type?: string;
  duration?: number;
  durationUnits?: string;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  dosingInstructions?: string;
  concept?: string;
  dateActivated?: string;
  previousOrder?: string;
  asNeededCondition?: string;
  orderReasonNonCoded?: string;
  instructions?: string;
}

export interface PatientOrderFetchResponse {
  results: Array<Order>;
}

export interface Order {
  uuid: string;
  action: string;
  asNeeded: boolean;
  asNeededCondition?: string;
  autoExpireDate: string;
  brandName?: string;
  careSetting: OpenmrsResource;
  commentToFulfiller: string;
  concept: OpenmrsResource;
  dateActivated: string;
  dateStopped?: string | null;
  dispenseAsWritten: boolean;
  dose: number;
  doseUnits: OpenmrsResource;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  drug: Drug;
  duration: number;
  durationUnits: OpenmrsResource;
  encounter: OpenmrsResource;
  frequency: OpenmrsResource;
  instructions?: string | null;
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderType: {
    conceptClasses: Array<any>;
    description: string;
    display: string;
    name: string;
    parent: string | null;
    retired: boolean;
    uuid: string;
  };
  orderer: {
    display: string;
    person: {
      display: string;
    };
    uuid: string;
  };
  patient: OpenmrsResource;
  previousOrder: { uuid: string; type: string; display: string } | null;
  quantity: number;
  quantityUnits: OpenmrsResource;
  route: OpenmrsResource;
  scheduleDate: null;
  urgency: string;
}

export interface Drug {
  uuid: string;
  strength: string;
  concept: OpenmrsResource;
  dosageForm: OpenmrsResource;
  display: string;
}

export type PostDataPrepFunction = (order: OrderBasketItem, patientUuid: string, encounterUuid: string) => OrderPost;
