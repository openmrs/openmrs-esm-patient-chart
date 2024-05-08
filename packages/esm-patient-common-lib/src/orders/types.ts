import { type OpenmrsResource } from '@openmrs/esm-framework';

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
}

export interface OrderPost {
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
  labReferenceNumber?: string;
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
  urgency: string;

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
  fulfillerStatus: string;
  fulfillerComment: string;
  specimenSource: string;
  laterality: string;
  clinicalHistory: string;
  numberOfRepeats: string;
  type: string;
  labReferenceNumber?: string;
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

export interface Drug {
  uuid: string;
  strength: string;
  concept: OpenmrsResource;
  dosageForm: OpenmrsResource;
  display: string;
}

export type PostDataPrepFunction = (order: OrderBasketItem, patientUuid: string, encounterUuid: string) => OrderPost;

// Adopted from @openmrs/esm-patient-medications-app package. We should consider maintaining a single shared types file
export interface DrugOrderBasketItem extends OrderBasketItem {
  drug: Drug;
  unit: any;
  commonMedicationName: string;
  dosage: number;
  frequency: any;
  route: any;
  quantityUnits: any;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  startDate: Date | string;
  durationUnit: any;
  duration: number | null;
  pillsDispensed: number;
  numRefills: number;
  indication: string;
  isFreeTextDosage: boolean;
  freeTextDosage: string;
  previousOrder?: string;
  template?: any;
}

export interface LabOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  labReferenceNumber?: string;
  urgency?: string;
  instructions?: string;
  previousOrder?: string;
  orderReason?: string;
  orderNumber?: string;
}
