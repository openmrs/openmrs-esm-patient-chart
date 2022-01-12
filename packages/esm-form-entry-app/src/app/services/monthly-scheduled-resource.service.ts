import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class MonthlyScheduleResourceService {
  constructor(private http: HttpClient) {}

  public getMonthlySchedule(params) {
    const requestHeader = new HttpHeaders().set('Authorization', 'Basic ZGtpYmV0Ol9Eb25hbGQyMDE5Kg==');
    return this.http.get(
      'https://ngx.ampath.or.ke/etl-latest/etl/get-monthly-schedule?startDate=2022-01-31&endDate=2022-02-04&locationUuids=18c343eb-b353-462a-9139-b16606e6b6c2&limit=5&programType=781d85b0-1359-11df-a1f1-0026b9348838,781d897a-1359-11df-a1f1-0026b9348838,96047aaf-7ab3-45e9-be6a-b61810fe617d,c19aec66-1a40-4588-9b03-b6be55a8dd1d,f7793d42-11ac-4cfd-9b35-e0a21a7a7c31,334c9e98-173f-4454-a8ce-f80b20b7fdf0,96ba279b-b23b-4e78-aba9-dcbd46a96b7b,781d8880-1359-11df-a1f1-0026b9348838&groupBy=groupByPerson,groupByAttendedDate,groupByRtcDate',
      { headers: requestHeader },
    );
  }
}
