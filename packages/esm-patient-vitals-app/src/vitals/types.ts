import { type PatientVitalsAndBiometrics, type ObservationInterpretation, type SortValue } from '../common';

export interface VitalsTableRow extends PatientVitalsAndBiometrics {
  id: string;
  dateRender: string;
  bloodPressureRender: string;
  bloodPressureRenderInterpretation?: ObservationInterpretation;
  pulseRender: string | number;
  pulseRenderInterpretation?: ObservationInterpretation;
  spo2Render: string | number;
  spo2RenderInterpretation?: ObservationInterpretation;
  temperatureRender: string | number;
  temperatureRenderInterpretation?: ObservationInterpretation;
  respiratoryRateRender: string | number;
  respiratoryRateRenderInterpretation?: ObservationInterpretation;
}

export interface VitalsTableHeader {
  key:
    | 'dateRender'
    | 'temperatureRender'
    | 'bloodPressureRender'
    | 'pulseRender'
    | 'respiratoryRateRender'
    | 'spo2Render';
  conceptUuid?: string;
  header: string;
  isSortable?: boolean;
  sortValues: (row: VitalsTableRow) => Array<SortValue>;
}
