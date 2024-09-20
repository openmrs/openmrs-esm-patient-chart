import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WindowRef } from '../window-ref';
import { map, Observable } from 'rxjs';
import dayjs from 'dayjs';
import { AppointmentServiceData, AppointmentServiceOption } from '../types';

/**
 * Service for managing appointments and appointment services.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
  ) {
    this.baseUrl = `${this.windowRef.openmrsRestBase}`;
  }

  /**
   * Fetches all appointment services, optionally filtered by a search term.
   * @param searchTerm - Optional search term to filter services by name.
   * @returns An Observable of filtered AppointmentServiceData array.
   */
  public fetchAllAppointmentServices(searchTerm: string = ''): Observable<Array<AppointmentServiceData>> {
    const url = `${this.baseUrl}appointmentService/all/full`;
    return this.http
      .get<Array<AppointmentServiceData>>(url)
      .pipe(
        map((services) => services.filter((service) => service.name?.toLowerCase().includes(searchTerm.toLowerCase()))),
      );
  }

  /**
   * Fetches an appointment service by its UUID.
   * @param uuid - The UUID of the appointment service.
   * @returns An Observable of AppointmentServiceOption or null if not found.
   */
  public fetchAppointmentServiceByUuid(uuid: string): Observable<AppointmentServiceOption | null> {
    return this.fetchAllAppointmentServices().pipe(
      map((services) => services.find((service) => service.uuid === uuid)),
      map((service) => (service ? { label: service.name, value: service.uuid } : null)),
    );
  }

  /**
   * Creates a new appointment.
   * @param appointmentData - The data for the new appointment.
   * @returns An Observable of the created appointment.
   */
  public createAppointment(appointmentData: any): Observable<any> {
    const url = `${this.baseUrl}appointment`;
    return this.http.post(url, appointmentData);
  }

  /**
   * Fetches patient appointments from a given start date.
   * @param patientUuid - The UUID of the patient.
   * @param startDate - The start date for fetching appointments.
   * @returns An Observable of the patient's appointments.
   */
  public fetchPatientAppointmentsFromDate(patientUuid: string, startDate: string): Observable<any> {
    const url = `${this.baseUrl}appointments/search`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const payload = {
      patientUuid,
      startDate: dayjs(startDate).toISOString(),
    };
    return this.http.post(url, payload, { headers });
  }

  /**
   * Fetches appointment summary for a given date range.
   * @param startDate - The start date of the range.
   * @param endDate - The end date of the range.
   * @returns An Observable of the appointment summary.
   */
  public fetchAppointmentSummaryByDateRange(startDate: string, endDate: string): Observable<any> {
    const url = `${this.baseUrl}appointment/appointmentSummary`;
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

    return this.http.get(url, { params });
  }
}
