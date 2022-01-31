import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class NotificationService {
  private _notification: BehaviorSubject<Error> = new BehaviorSubject(null);
  readonly notification$: Observable<Error> = this._notification.asObservable();

  constructor() {}

  notify(message) {
    this._notification.next(message);
  }
}
