import type { Encounter, OpenmrsResource, Visit, Workspace2DefinitionProps } from '@openmrs/esm-framework';

export interface Concept extends OpenmrsResource {
  name?: {
    display: string;
  };
  names?: Array<{
    display: string;
  }>;
  conceptClass?: {
    uuid: string;
  };
  answers?: Array<Concept>;
  setMembers?: Array<Concept>;
}
export interface Drug {
  uuid: string;
  strength: string;
  concept: Concept;
  dosageForm: OpenmrsResource;
  display: string;
}

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
  action: OrderAction;
  display: string;
  uuid?: string;
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
  concept?: Concept;
  instructions?: string;
  urgency?: OrderUrgency;
  previousOrder?: string;
  orderType?: string;
  orderNumber?: string;
  scheduledDate?: Date;
  encounterUuid?: string;
  visit: Visit;
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
  type?: string;
  concept?: string;
  dateActivated?: string;
  previousOrder?: string;
  asNeededCondition?: string;
  orderReasonNonCoded?: string;
  orderReason?: string;
  instructions?: string;
  accessionNumber?: string;
  orderType?: string;
  scheduledDate?: string | Date;
}

export interface DrugOrderPost extends OrderPost {
  drug?: string;
  dose?: number;
  doseUnits?: string;
  route?: string;
  frequency?: string;
  asNeeded?: boolean;
  numRefills?: number;
  quantity?: number;
  quantityUnits?: string;
  duration?: number;
  durationUnits?: string;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  dosingInstructions?: string;
}

export type TestOrderPost = OrderPost;

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
  concept: Concept;
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
  encounter: Encounter;
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
  fulfillerStatus: FulfillerStatus;
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

export type FulfillerStatus = 'RECEIVED' | 'IN_PROGRESS' | 'EXCEPTION' | 'ON_HOLD' | 'DECLINED' | 'COMPLETED';

/**
 * A function type that converts a OrderBasketItem into
 * a POST order payload
 */
export type PostDataPrepFunction = (
  order: OrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
  orderingProviderUuid: string,
) => OrderPost;

export interface OrderBasketExtensionProps {
  patient: fhir.Patient;
  launchDrugOrderForm(order?: DrugOrderBasketItem): void;
  launchLabOrderForm(orderTypeUuid: string, order?: TestOrderBasketItem): void;
  launchGeneralOrderForm(orderTypeUuid: string, order?: OrderBasketItem): void;
}

export interface DrugOrderBasketItem extends OrderBasketItem {
  drug: Drug;
  unit: DosingUnit;
  commonMedicationName: string;
  dosage: number;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  quantityUnits: QuantityUnit;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  startDate: Date | string;
  durationUnit: DurationUnit;
  duration: number | null;
  pillsDispensed: number | null;
  numRefills: number | null;
  indication: string;
  isFreeTextDosage: boolean;
  freeTextDosage: string;
  previousOrder?: string;
  template?: OrderTemplate;
}

export interface DrugOrderTemplate {
  uuid: string;
  name: string;
  drug: Drug;
  template: OrderTemplate;
}

export interface OrderTemplate {
  type: string;
  dosingType: string;
  dosingInstructions: DosingInstructions;
}

export interface DosingInstructions {
  dose: Array<MedicationDosage>;
  units: Array<DosingUnit>;
  route: Array<MedicationRoute>;
  frequency: Array<MedicationFrequency>;
  instructions?: Array<MedicationInstructions>;
  durationUnits?: Array<DurationUnit>;
  quantityUnits?: Array<QuantityUnit>;
  asNeeded?: boolean;
  asNeededCondition?: string;
}

export interface MedicationDosage extends Omit<CommonMedicationProps, 'value'> {
  value: number;
}

export type MedicationFrequency = CommonMedicationValueCoded;

export type MedicationRoute = CommonMedicationValueCoded;

export type MedicationInstructions = CommonMedicationProps;

export type DosingUnit = CommonMedicationValueCoded;

export type QuantityUnit = CommonMedicationValueCoded;

export type DurationUnit = CommonMedicationValueCoded;

interface CommonMedicationProps {
  value: string;
  default?: boolean;
}

export interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded: string;
  names?: string[];
}
export interface TestOrderBasketItem extends OrderBasketItem {
  testType: {
    label: string;
    conceptUuid: string;
  };
  orderReason?: string;
  specimenSource?: string;
}

export interface OrderBasketWindowProps {
  encounterUuid: string;
  onOrderBasketSubmitted?: (encounterUuid: string, postedOrders: Array<Order>) => void;
}

export interface ExportedOrderBasketWindowProps {
  encounterUuid: string;
  drugOrderWorkspaceName: string;
  labOrderWorkspaceName: string;
  generalOrderWorkspaceName: string;
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  mutateVisitContext: () => void;
  onOrderBasketSubmitted?: (encounterUuid: string, postedOrders: Array<Order>) => void;
}
