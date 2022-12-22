import { DosingUnit, MedicationFrequency, MedicationRoute, OrderTemplate } from '../api/drug-order-template';
import { OpenmrsResource } from '@openmrs/esm-framework';
import { Drug } from './order';

export interface OrderBasketItem {
  uuid?: string;
  action: 'NEW' | 'REVISE' | 'DISCONTINUE' | 'RENEWED' | undefined;
  drug: Drug;
  unit: DosingUnit;
  commonMedicationName: string;
  dosage: number;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  encounterUuid: string;
  orderer: string;
  careSetting: string;
  quantityUnits: string;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  startDate: Date;
  durationUnit: OpenmrsResource;
  duration: number | null;
  pillsDispensed: number;
  numRefills: number;
  indication: string;
  isFreeTextDosage: boolean;
  freeTextDosage: string;
  previousOrder?: string;
  orderError?: Error & {
    responseBody?: {
      error?: {
        code?: string;
        detail?: string;
        message?: string;
      };
    };
  };
  template?: OrderTemplate;
}
