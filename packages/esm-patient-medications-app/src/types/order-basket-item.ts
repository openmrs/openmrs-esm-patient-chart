import {
  CommonMedicationDosage,
  CommonMedicationDosageUnit,
  CommonMedicationFrequency,
  CommonMedicationRoute,
} from '../api/common-medication';
import { OpenmrsResource } from './openmrs-resource';
import { Drug } from './order';

export interface OrderBasketItem {
  uuid?: string;
  action: 'NEW' | 'REVISE' | 'DISCONTINUE' | 'RENEWED' | undefined;
  drug: Drug;
  commonMedicationName: string;
  dosage: CommonMedicationDosage;
  dosageUnit: CommonMedicationDosageUnit;
  frequency: CommonMedicationFrequency;
  route: CommonMedicationRoute;
  encounterUuid: string;
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
}
