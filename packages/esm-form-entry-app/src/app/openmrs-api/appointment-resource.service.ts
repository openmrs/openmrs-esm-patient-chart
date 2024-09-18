import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WindowRef } from '../window-ref';
import { map, Observable } from 'rxjs';
import { OpenmrsResource } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

interface AppointmentServiceData {
  appointmentServiceId: number;
  name: string;
  description?: string;
  speciality: OpenmrsResource;
  startTime: string;
  endTime: string;
  maxAppointmentsLimit?: number;
  durationMins?: number;
  location: OpenmrsResource;
  uuid: string;
  color: string;
  initialAppointmentStatus?: string;
  creatorName?: string;
  weeklyAvailability: any[];
  serviceTypes: any[];
}

interface AppointmentServiceOption {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
  ) {
    this.baseUrl = this.windowRef.openmrsRestBase;
  }

  public fetchAllAppointmentServices(searchTerm: string = ''): Observable<AppointmentServiceData[]> {
    const url = `${this.baseUrl}appointmentService/all/full`;
    return this.http
      .get<AppointmentServiceData[]>(url)
      .pipe(
        map((services) => services.filter((service) => service.name?.toLowerCase().includes(searchTerm.toLowerCase()))),
      );
  }

  public fetchAppointmentServiceByUuid(uuid: string): Observable<AppointmentServiceOption> {
    return this.fetchAllAppointmentServices().pipe(
      map((services) => services.find((service) => service.uuid === uuid)),
      map((service) => (service ? { label: service.name, value: service.uuid } : null)),
    );
  }

  public createAppointment(appointmentData: any): Observable<any> {
    const url = `${this.baseUrl}appointment`;
    return this.http.post(url, appointmentData);
  }

  public fetchPatientAppointmentsFromDate(patientUuid: string, startDate: string): Observable<any> {
    const url = `${this.baseUrl}appointments/search`;
    const params = {
      patientUuid,
      startDate: dayjs(startDate).toISOString(),
    };
    return this.http.post(url, params);
  }
}
