import { type amPm } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';

export type VisitFormData = {
  visitStartDatetime: {
    date: Date;
    time: string;
    timeFormat: amPm;
  };
  visitStopDatetime: {
    date: Date;
    time: string;
    timeFormat: amPm;
  };
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

export function getDateTimeFormat(datetime: Date | string): [Date, string, 'AM' | 'PM'] {
  const dayJsDatetime = dayjs(datetime);
  return [
    dayJsDatetime.hour(0).minute(0).second(0).millisecond(0).toDate(),
    dayJsDatetime.format('hh:mm'),
    dayJsDatetime.hour() >= 12 ? 'PM' : 'AM',
  ];
}
