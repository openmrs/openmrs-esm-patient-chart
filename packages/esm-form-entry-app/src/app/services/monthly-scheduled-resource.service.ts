import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MonthlyScheduleParams } from '../types';
import { WindowRef } from '../window-ref';
import { ConfigResourceService } from './config-resource.service';

@Injectable()
export class MonthlyScheduleResourceService {
  constructor(private http: HttpClient, private windowRef: WindowRef, private configResource: ConfigResourceService) {}

  public getMonthlySchedule(params: MonthlyScheduleParams) {
    const etlBaseUrl = this.configResource.getConfig().baseEtlUrl;
    const etlUrl = `${etlBaseUrl}get-monthly-schedule?startDate=${params.startDate}&endDate=${params.endDate}&locationUuids=${params.locationUuids}&limit=${params.limit}&programType=${params.programType}&groupBy=groupByPerson,groupByAttendedDate,groupByRtcDate`;
    return this.http.get(`${this.windowRef.nativeWindow.openmrsBase}${etlUrl}`);
  }
}
