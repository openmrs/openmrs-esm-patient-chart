import { type amPm } from '@openmrs/esm-patient-common-lib';

export type VisitFormData = {
  visitStartDate: Date;
  visitStartTime: string;
  visitStartTimeFormat: amPm;
  visitStopDate: Date;
  visitStopTime: string;
  visitStopTimeFormat: amPm;
  programType: string;
  visitType: string;
  visitLocation: {
    display?: string;
    uuid?: string;
  };
  visitAttributes: {
    [x: string]: string;
  };
};
