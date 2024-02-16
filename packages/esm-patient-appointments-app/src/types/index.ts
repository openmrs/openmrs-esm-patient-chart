import type { OpenmrsResource } from '@openmrs/esm-framework';

export interface AppointmentsFetchResponse {
  data: Array<Appointment>;
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
  service: AppointmentService;
  startDateTime: string;
  status: string;
  dateHonored: Date | number;
  uuid: string;
}

export interface ServiceTypes {
  duration: number;
  name: string;
  uuid: string;
}

export interface AppointmentService {
  appointmentServiceId: number;
  color: string;
  creatorName: string;
  description: string;
  durationMins: number;
  endTime: string;
  initialAppointmentStatus: string;
  location: OpenmrsResource;
  maxAppointmentsLimit: number | null;
  name: string;
  speciality: OpenmrsResource;
  startTime: string;
  uuid: string;
  serviceTypes: Array<ServiceTypes>;
}
