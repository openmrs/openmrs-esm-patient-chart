import { type PatientVitalsAndBiometrics } from '../common';

export interface VitalsTableRow extends PatientVitalsAndBiometrics {
  id: string;
  dateRender: string;
  bloodPressureRender: string;
  pulseRender: string | number;
  spo2Render: string | number;
  temperatureRender: string | number;
  respiratoryRateRender: string | number;
  generalPatientNoteRender: string;
}

export interface VitalsTableHeader {
  key:
    | 'dateRender'
    | 'temperatureRender'
    | 'bloodPressureRender'
    | 'pulseRender'
    | 'respiratoryRateRender'
    | 'spo2Render'
    | 'generalPatientNoteRender';
  header: string;
  isSortable?: boolean;
  sortFunc: (valueA: VitalsTableRow, valueB: VitalsTableRow) => number;
}
