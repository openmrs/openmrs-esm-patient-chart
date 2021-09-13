import { OpenmrsResource } from '@openmrs/esm-framework';

export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}

export interface Appointment {
  appointmentKind: string;
  appointmentNumber: string;
  comments: string;
  endDateTime: Date | number;
  location: OpenmrsResource;
  patient: fhir.Patient;
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  recurring: boolean;
  service: {
    appointmentServiceId: number;
    color: string;
    creatorName: string;
    description: string;
    durationMins: string;
    endTime: string;
    initialAppointmentStatus: string;
    location: OpenmrsResource;
    maxAppointmentsLimit: number | null;
    name: string;
    speciality: OpenmrsResource;
    startTime: string;
    uuid: string;
  };
  serviceType: string;
  startDateTime: number | any;
  status: string;
  uuid: string;
}
