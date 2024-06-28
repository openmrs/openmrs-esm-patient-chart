import { type PatientVitalsAndBiometrics } from '../common';

export interface BiometricsTableRow extends PatientVitalsAndBiometrics {
  id: string;
  dateRender: string;
  weightRender: string | number;
  heightRender: string | number;
  bmiRender: string | number;
  muacRender: string | number;
}

export interface BiometricsTableHeader {
  key: 'dateRender' | 'weightRender' | 'heightRender' | 'bmiRender' | 'muacRender';
  header: string;
  isSortable?: boolean;
  sortFunc: (valueA: BiometricsTableRow, valueB: BiometricsTableRow) => number;
}
