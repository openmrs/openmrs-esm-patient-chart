import type { Drug, OrderBasketItem } from '@openmrs/esm-patient-common-lib';

export interface DrugOrderBasketItem extends OrderBasketItem {
  asNeeded: boolean;
  asNeededCondition: string;
  commonMedicationName: string;
  dateActivated: Date | string;
  dosage: number;
  drug: Drug;
  duration: number | null;
  durationUnit: DurationUnit;
  freeTextDosage: string;
  frequency: MedicationFrequency;
  indication: string;
  isFreeTextDosage: boolean;
  numRefills: number;
  patientInstructions: string;
  pillsDispensed: number;
  previousOrder?: string;
  quantityUnits: QuantityUnit;
  route: MedicationRoute;
  template?: OrderTemplate;
  unit: DosingUnit;
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
  asNeeded?: boolean;
  asNeededCondition?: string;
  dose: Array<MedicationDosage>;
  durationUnits?: Array<DurationUnit>;
  frequency: Array<MedicationFrequency>;
  instructions?: Array<MedicationInstructions>;
  quantityUnits?: Array<QuantityUnit>;
  route: Array<MedicationRoute>;
  units: Array<DosingUnit>;
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
  value?: string;
  default?: boolean;
}

export interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded?: string;
  names?: string[];
}
