import { type Drug, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';

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
