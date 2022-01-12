import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MonthlyScheduleParams } from '../types';
import { WindowRef } from '../window-ref';

@Injectable()
export class MonthlyScheduleResourceService {
  constructor(private http: HttpClient, private windowRef: WindowRef) {}

  public getMonthlySchedule(params: MonthlyScheduleParams) {
    const etlUrl = `/etl-latest/etl/get-monthly-schedule?startDate=${params.startDate}&endDate=${params.endDate}&locationUuids=${params.locationUuids}&limit=${params.limit}&programType=${params.programType}&groupBy=groupByPerson,groupByAttendedDate,groupByRtcDate`;
    const url = this.windowRef.nativeWindow.openmrsBase.concat(etlUrl);
    return this.http.get(url);
  }
}
