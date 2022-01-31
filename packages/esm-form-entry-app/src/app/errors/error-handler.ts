import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../services/notification.service';
//@ts-ignore
import { showToast } from '@openmrs/esm-framework';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: HttpErrorResponse) {
    // Error status code is 400s and 500s
    if (error.status > 400) {
      showToast({
        critical: true,
        kind: 'error',
        description: error.message,
        title: `Rest API Error`,
      });
    }
    {
      const notificationService = this.injector.get(NotificationService);
      return notificationService.notify(error.message);
    }
  }
}
