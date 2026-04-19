import { type PatientVitalsAndBiometrics, type ObservationInterpretation } from '../common';

export interface BiometricsTableRow extends PatientVitalsAndBiometrics {
  id: string;
  dateRender: string;
  weightRender: string | number;
  weightRenderInterpretation?: ObservationInterpretation;
  heightRender: string | number;
  heightRenderInterpretation?: ObservationInterpretation;
  bmiRender: string | number;
  bmiRenderInterpretation?: ObservationInterpretation;
  muacRender: string | number;
  muacRenderInterpretation?: ObservationInterpretation;
}

export interface BiometricsTableHeader {
  key: 'dateRender' | 'weightRender' | 'heightRender' | 'bmiRender' | 'muacRender';
  conceptUuid?: string;
  header: string;
  isSortable?: boolean;
  sortFunc: (valueA: BiometricsTableRow, valueB: BiometricsTableRow) => number;
}
