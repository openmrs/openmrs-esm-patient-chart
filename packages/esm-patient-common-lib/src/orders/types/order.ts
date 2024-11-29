import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { Drug } from './drug-order';

export type OrderAction = 'NEW' | 'REVISE' | 'DISCONTINUE' | 'RENEW';

export interface ExtractedOrderErrorObject {
  message: string;
  fieldErrors: string[];
  globalErrors: string[];
}
export interface OrderErrorObject {
  responseBody?: {
    error?: {
      message?: string;
      fieldErrors?: {
        [fieldName: string]: {
          message: string;
          [key: string]: string;
        }[];
      };
      globalErrors?: string[];
    };
  };
}

export interface OrderBasketItem {
  action?: OrderAction;
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
  extractedOrderError?: ExtractedOrderErrorObject;
  isOrderIncomplete?: boolean;
  /**
   * An optional identifier from the fulfiller (e.g., lab system) for the specimen or record associated with the order.
   */
  accessionNumber?: string;
  concept?: OpenmrsResource;
  instructions?: string;
  urgency?: OrderUrgency;
  previousOrder?: string;
  orderType?: string;
  orderNumber?: string;
}

export type OrderUrgency = 'ROUTINE' | 'STAT' | 'ON_SCHEDULED_DATE';

export type PriorityOption = {
  label: string;
  value: OrderUrgency;
};

export interface OrderPost {
  urgency?: OrderUrgency;
  action?: OrderAction;
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
  orderReason?: string;
  instructions?: string;
  accessionNumber?: string;
  orderType?: string;
}

export interface PatientOrderFetchResponse {
  results: Array<Order>;
}

export interface Order {
  uuid: string;
  action: OrderAction;
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
  urgency: OrderUrgency;

  // additional properties
  accessionNumber: string;
  scheduledDate: string;
  display: string;
  auditInfo: {
    creator: {
      uuid: string;
      display: string;
    };
    dateCreated: string;
    changedBy: string;
    dateChanged: string;
  };
  fulfillerStatus: 'RECEIVED' | 'IN_PROGRESS' | 'EXCEPTION' | 'ON_HOLD' | 'DECLINED' | 'COMPLETED' | 'DISCONINTUED';
  fulfillerComment: string;
  specimenSource: string;
  laterality: string;
  clinicalHistory: string;
  numberOfRepeats: string;
  type: string;
}

export interface OrderTypeFetchResponse {
  results: Array<OrderType>;
}

export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  retired: boolean;
  description: string;
}

export type FulfillerStatus = 'EXCEPTION' | 'RECEIVED' | 'COMPLETED' | 'IN_PROGRESS' | 'ON_HOLD' | 'DECLINED';

export type PostDataPrepFunction = (
  order: OrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
) => OrderPost;
