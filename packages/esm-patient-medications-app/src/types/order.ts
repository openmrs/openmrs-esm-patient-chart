import { OpenmrsResource } from './openmrs-resource';

export interface Order {
  uuid: string;
  action: string;
  asNeeded: boolean;
  asNeededCondition?: string;
  autoExpireDate: Date;
  brandName?: string;
  careSetting: OpenmrsResource;
  commentToFulfiller: string;
  dateActivated: Date;
  dateStopped?: Date | null;
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
  orderer: OpenmrsResource;
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
  name: string;
  strength: string;
  concept: OpenmrsResource;
  dosageForm: OpenmrsResource;
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
}
