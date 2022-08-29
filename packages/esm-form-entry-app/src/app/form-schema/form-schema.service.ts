import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, Subject, of, forkJoin } from 'rxjs';
import { concat, first, map, take, tap } from 'rxjs/operators';

import { FormResourceService } from '../openmrs-api/form-resource.service';
import { FormSchemaCompiler } from '@openmrs/ngx-formentry';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormSchema, Questions } from '../types';

@Injectable()
export class FormSchemaService {
  constructor(
    private formsResourceService: FormResourceService,
    private localStorage: LocalStorageService,
    private formSchemaCompiler: FormSchemaCompiler,
  ) {}

  public getFormSchemaByUuid(formUuid: string, cached: boolean = true): Observable<FormSchema> {
    const cachedCompiledSchema = this.getCachedCompiledSchemaByUuid(formUuid);
    if (cachedCompiledSchema && cached) {
      return of(cachedCompiledSchema);
    }

    return forkJoin({
      unCompiledSchema: this.getFormSchemaByUuidFromServer(formUuid).pipe(take(1)),
      formMetadataObject: this.formsResourceService.getFormMetaDataByUuid(formUuid).pipe(take(1)),
    }).pipe(
      map(({ unCompiledSchema, formMetadataObject }) => {
        const formSchema: any = unCompiledSchema.form;
        const referencedComponents: any = unCompiledSchema.referencedComponents;

        formMetadataObject.pages = formSchema.pages || [];
        formMetadataObject.referencedForms = formSchema.referencedForms || [];
        formMetadataObject.processor = formSchema.processor;

        return this.formSchemaCompiler.compileFormSchema(
          formMetadataObject,
          referencedComponents,
        ) as unknown as FormSchema;
      }),
      tap((compiledSchema) => this.cacheCompiledSchemaByUuid(formUuid, compiledSchema)),
    );
  }

  private getCachedCompiledSchemaByUuid(formUuid: string): any {
    return this.localStorage.getObject(formUuid);
  }

  private cacheCompiledSchemaByUuid(formUuid, schema): void {
    this.localStorage.setObject(formUuid, schema);
  }

  private getFormSchemaByUuidFromServer(formUuid: string) {
    const formSchema: ReplaySubject<any> = new ReplaySubject(1);
    this.fetchFormSchemaUsingFormMetadata(formUuid).subscribe(
      (schema: any) => {
        // check whether whether formSchema has references b4 hitting getFormSchemaWithReferences
        if (schema.referencedForms && schema.referencedForms.length > 0) {
          this.getFormSchemaWithReferences(schema).subscribe(
            (form: object) => {
              formSchema.next(form);
            },
            (err) => {
              console.error(err);
              formSchema.error(err);
            },
          );
        } else {
          formSchema.next({
            form: schema,
            referencedComponents: [],
          });
        }
      },
      (err) => {
        console.error(err);
        formSchema.error(err);
      },
    );
    return formSchema;
  }

  private getFormSchemaWithReferences(schema: any): ReplaySubject<any> {
    const formSchemaWithReferences: ReplaySubject<any> = new ReplaySubject(1);
    this.fetchFormSchemaReferences(schema).subscribe(
      (schemaReferences: Array<any>) => {
        const forms: object = {
          form: schema,
          referencedComponents: schemaReferences,
        };
        formSchemaWithReferences.next(forms);
      },
      (err) => {
        console.error(err);
        formSchemaWithReferences.error(err);
      },
    );
    return formSchemaWithReferences;
  }

  private fetchFormSchemaReferences(formSchema: any): Observable<any> {
    // first create the observableBatch/ArrayOfRequests
    const observableBatch: Array<Observable<any>> = [];
    const referencedForms: Array<any> = formSchema.referencedForms;
    if (Array.isArray(referencedForms) && referencedForms.length > 0) {
      const referencedUuids: Array<string> = this.getFormUuidArray(referencedForms);
      referencedUuids.forEach((referencedUuid: any, key) => {
        observableBatch.push(this.fetchFormSchemaUsingFormMetadata(referencedUuid));
      });
    }

    // now get schemaReferences sequentially
    const schemaReferences: any = [];
    return Observable.create((observer: Subject<any>) => {
      const current = 0;
      const max = observableBatch.length;

      if (current === max) {
        // resolve
        observer.next(schemaReferences);
        return;
      }

      let concatenatedObservables = observableBatch[0];
      for (let i = 1; i < observableBatch.length; i++) {
        concatenatedObservables = concatenatedObservables.pipe(concat(observableBatch[i]));
      }
      concatenatedObservables.subscribe(
        (schema) => {
          schemaReferences.push(schema);
        },
        (err) => {
          observer.error(err);
        },
        () => {
          observer.next(schemaReferences);
        },
      );
    }).pipe(first());
  }

  private fetchFormSchemaUsingFormMetadata(formUuid: string): Observable<any> {
    return Observable.create((observer: Subject<any>) => {
      return this.formsResourceService.getFormMetaDataByUuid(formUuid).subscribe(
        (formMetadataObject: any) => {
          if (formMetadataObject.resources.length > 0) {
            const { resources } = formMetadataObject;
            const valueReferenceUuid = resources?.find(({ name }) => name === 'JSON schema').valueReference;
            if (valueReferenceUuid) {
              this.formsResourceService.getFormClobDataByUuid(valueReferenceUuid).subscribe(
                (clobData: any) => {
                  observer.next(clobData);
                },
                (err) => {
                  console.error(err);
                  observer.error(err);
                },
              );
            } else {
              observer.next([]);
            }
          } else {
            observer.error(formMetadataObject.display + ':This formMetadataObject has no resource');
          }
        },
        (err) => {
          console.error(err);
          observer.error(err);
        },
      );
    }).pipe(first());
  }

  private getFormUuidArray(formSchemaReferences: Array<object>) {
    const formUuids: Array<string> = [];
    formSchemaReferences.forEach((value: any, key) => {
      formUuids.push(value.ref.uuid);
    });
    return formUuids;
  }

  public static getUnlabeledConceptIdentifiersFromSchema(form: FormSchema): Array<string> {
    const results = new Set<string>();
    const walkQuestions = (questions: Array<Questions>) => {
      for (const question of questions) {
        if (typeof question.concept === 'string') {
          results.add(question.concept);
        }

        if (typeof question.questionOptions?.concept === 'string') {
          results.add(question.questionOptions.concept);
        }

        for (const answer of question.questionOptions?.answers ?? []) {
          if (typeof answer.concept === 'string') {
            results.add(answer.concept);
          }
        }

        if (Array.isArray(question.questions)) {
          walkQuestions(question.questions);
        }
      }
    };

    for (const page of form.pages ?? []) {
      for (const section of page.sections ?? []) {
        walkQuestions(section.questions ?? []);
      }
    }

    return [...results];
  }
}
