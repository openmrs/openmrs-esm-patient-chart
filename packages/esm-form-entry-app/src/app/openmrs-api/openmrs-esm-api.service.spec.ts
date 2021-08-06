import { TestBed } from '@angular/core/testing';

import { OpenmrsEsmApiService } from './openmrs-esm-api.service';
import { OpenmrsApiModule } from './openmrs-api.module';

describe('OpenmrsApiService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
    }),
  );

  it('should be created', () => {
    const service: OpenmrsEsmApiService = TestBed.get(OpenmrsEsmApiService);
    expect(service).toBeTruthy();
  });
});
