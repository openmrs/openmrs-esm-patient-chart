import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { EncounterResourceService } from './encounter-resource.service';
import { PatientPreviousEncounterService } from './patient-previous-encounter.service';
import { type Encounter } from '../types';

describe('PatientPreviousEncounterService', () => {
  const encounterTypeUuid = 'enc-type-uuid';
  const patientUuid = 'patient-uuid';

  const olderEncounter = {
    uuid: 'older-uuid',
    encounterDatetime: '2023-01-01T00:00:00.000+0000',
    encounterType: { uuid: encounterTypeUuid, display: 'Visit Note' },
  } as unknown as Encounter;

  const newerEncounter = {
    uuid: 'newer-uuid',
    encounterDatetime: '2024-06-01T00:00:00.000+0000',
    encounterType: { uuid: encounterTypeUuid, display: 'Visit Note' },
  } as unknown as Encounter;

  // The full encounter returned by the follow-up getEncounterByUuid lookup.
  const fullEncounter = {
    ...newerEncounter,
    obs: [],
  } as unknown as Encounter;

  let service: PatientPreviousEncounterService;
  let encounterResource: jasmine.SpyObj<EncounterResourceService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj<EncounterResourceService>('EncounterResourceService', [
      'getEncountersByPatientUuid',
      'getEncounterByUuid',
    ]);

    TestBed.configureTestingModule({
      providers: [PatientPreviousEncounterService, { provide: EncounterResourceService, useValue: spy }],
    });

    service = TestBed.inject(PatientPreviousEncounterService);
    encounterResource = TestBed.inject(EncounterResourceService) as jasmine.SpyObj<EncounterResourceService>;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('resolves with the most recent encounter matching the requested type', async () => {
    // Returned out of chronological order to exercise the descending sort.
    encounterResource.getEncountersByPatientUuid.and.returnValue(of([olderEncounter, newerEncounter]));
    encounterResource.getEncounterByUuid.and.returnValue(of(fullEncounter));

    const result = await service.getPreviousEncounter(encounterTypeUuid, patientUuid);

    expect(encounterResource.getEncounterByUuid).toHaveBeenCalledWith('newer-uuid');
    expect(result).toEqual(fullEncounter);
  });

  it('resolves with an empty object when no encounter matches the requested type', async () => {
    encounterResource.getEncountersByPatientUuid.and.returnValue(of([olderEncounter]));

    const result = await service.getPreviousEncounter('a-different-type', patientUuid);

    expect(encounterResource.getEncounterByUuid).not.toHaveBeenCalled();
    expect(Object.keys(result)).toHaveSize(0);
  });

  // Regression: a falsy encounters response previously left the Promise unsettled forever.
  it('resolves with an empty object when the encounters response is null', async () => {
    encounterResource.getEncountersByPatientUuid.and.returnValue(of(null));

    const result = await service.getPreviousEncounter(encounterTypeUuid, patientUuid);

    expect(encounterResource.getEncounterByUuid).not.toHaveBeenCalled();
    expect(Object.keys(result)).toHaveSize(0);
  });

  // Regression: a failed encounters lookup previously left the Promise unsettled (form stuck loading).
  it('rejects when fetching the patient encounters fails', async () => {
    const error = new Error('Network error');
    encounterResource.getEncountersByPatientUuid.and.returnValue(throwError(() => error));

    await expectAsync(service.getPreviousEncounter(encounterTypeUuid, patientUuid)).toBeRejectedWith(error);
  });

  it('rejects when fetching the matching encounter detail fails', async () => {
    const error = new Error('Detail lookup failed');
    encounterResource.getEncountersByPatientUuid.and.returnValue(of([newerEncounter]));
    encounterResource.getEncounterByUuid.and.returnValue(throwError(() => error));

    await expectAsync(service.getPreviousEncounter(encounterTypeUuid, patientUuid)).toBeRejectedWith(error);
  });
});
