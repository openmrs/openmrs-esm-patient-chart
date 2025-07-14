import { find } from 'lodash-es';
import { take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { EncounterResourceService } from './encounter-resource.service';
import { Encounter } from '../types';

@Injectable()
export class PatientPreviousEncounterService {
  constructor(private encounterResource: EncounterResourceService) {}

  public getPreviousEncounter(encounterType: string, patientUuid: string): Promise<Encounter> {
    return new Promise((resolve, reject) => {
      this.encounterResource.getEncountersByPatientUuid(patientUuid).subscribe(
        (encounters) => {
          if (encounters) {
            const sortedEncounters = encounters.sort((a, b) => {
              return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
            });
            const search = find(sortedEncounters, (e) => {
              return e.encounterType.uuid === encounterType;
            });

            if (search) {
              this.encounterResource
                .getEncounterByUuid(search.uuid)
                .pipe(take(1))
                .subscribe(
                  (_encounter) => {
                    resolve(_encounter);
                  },
                  (err) => {
                    reject(err);
                  },
                );
            } else {
              resolve(Object.create({}));
            }
          }
        },
        (error) => {
          console.error('Previous encounter', error);
        },
      );
    });
  }
}
