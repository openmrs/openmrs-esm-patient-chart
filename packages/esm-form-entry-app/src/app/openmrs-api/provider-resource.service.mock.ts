import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { PersonResourceService } from './person-resource.service';
import { WindowRef } from '../window-ref';
/**
 * FakeProgramEnrollmentResourceService
 */
export class FakeProviderResourceService {
  public returnErrorOnNext = false;

  constructor(
    protected http: HttpClient,
    protected windowRef: WindowRef,
    protected personService: PersonResourceService,
  ) {}

  public getProviderByUuid(uuid: string): Observable<any> {
    const subject = new BehaviorSubject<any>(null);
    subject.next([
      {
        uuid: 'uuid1',
        display: 'display',
      },
      {
        uuid: 'uuid2',
        display: 'display',
      },
    ]);
    return subject;
  }

  public searchProvider(searchText: string, cached: boolean = false, v: string = null): Observable<any> {
    const test: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    const provider = [
      {
        uuid: 'uuid',
        display: 'john',
        person: {
          uuid: 'uuid',
          display: 'display',
        },
      },
      {
        uuid: 'uuid1',
        display: 'kennedy',
        person: {
          uuid: 'uuid',
          display: 'display',
        },
      },
    ];

    if (!this.returnErrorOnNext) {
      test.next(provider);
    } else {
      test.error(new Error('Error loading provider'));
    }
    return test.asObservable();
  }
}
