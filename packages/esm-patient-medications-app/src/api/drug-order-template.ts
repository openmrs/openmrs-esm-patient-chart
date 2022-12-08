import { Drug } from '../types/order';

export interface DrugOrderTemplate {
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
  dose: number;
  units: Array<DosingUnit>;
  route: Array<MedicationRoute>;
  frequency: Array<MedicationFrequency>;
  instructions?: Array<MedicationInstructions>;
  asNeeded?: boolean;
  asNeededCondition?: string;
}

export type MedicationFrequency = CommonMedicationValueCoded;

export type MedicationRoute = CommonMedicationValueCoded;

export type MedicationInstructions = CommonMedicationProps;

export type DosingUnit = CommonMedicationValueCoded;

interface CommonMedicationProps {
  value: string;
  default?: boolean;
}

interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded: string;
}
