import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { first, map, take } from 'rxjs/operators';

import { FormResourceService } from '../openmrs-api/form-resource.service';
import { FormSchema, FormSchemaAndTranslations, Questions } from '../types';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class FormSchemaService {
  constructor(private formsResourceService: FormResourceService, private translateService: TranslateService) {}

  public getFormSchemaByUuid(formUuid: string, language = 'en'): Observable<FormSchema> {
    return forkJoin({
      formSchema: this.fetchFormSchemaUsingFormMetadata(formUuid).pipe(take(1)),
      formMetadataObject: this.formsResourceService.getFormMetaDataByUuid(formUuid).pipe(take(1)),
    }).pipe(
      map(({ formSchema, formMetadataObject }) => {
        const combinedFormMetadata = {
          ...formMetadataObject,
          ...formSchema,
        };

        if (combinedFormMetadata.translations) {
          this.translateService.setTranslation(language, combinedFormMetadata.translations, true);
        }

        return combinedFormMetadata;
      }),
    );
  }

  private fetchFormSchemaUsingFormMetadata(formUid: string): Observable<FormSchemaAndTranslations> {
    return new Observable<FormSchemaAndTranslations>((observer) => {
      return this.formsResourceService.getFormSchemaByFormUid(formUid).subscribe(
        (formSchema: FormSchemaAndTranslations) => {
          observer.next(formSchema);
        },
        (err) => {
          console.error(err);
          observer.error(err);
        },
      );
    }).pipe(first());
  }
}
