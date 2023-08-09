import {
  DosingUnit,
  DurationUnit,
  MedicationFrequency,
  MedicationRoute,
  OrderTemplate,
  QuantityUnit,
} from '../api/drug-order-template';
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
  orderer: string;
  careSetting: string;
  quantityUnits: QuantityUnit;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  // TODO: This is unused
  startDate: Date | string;
  durationUnit: DurationUnit;
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
