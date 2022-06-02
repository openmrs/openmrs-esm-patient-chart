import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, Subject } from 'rxjs';
import { concat, first } from 'rxjs/operators';

// import { FormSchemaCompiler } from 'ngx-openmrs-formentry';
import { FormResourceService } from '../openmrs-api/form-resource.service';
import { FormSchemaCompiler, QuestionGroup } from '@ampath-kenya/ngx-formentry';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormSchema, Questions } from '../types';
import { Form } from '@ampath-kenya/ngx-formentry/form-entry/form-factory/form';
import { GroupNode } from '@ampath-kenya/ngx-formentry/form-entry/form-factory/form-node';

@Injectable()
export class FormSchemaService {
  constructor(
    private formsResourceService: FormResourceService,
    private localStorage: LocalStorageService,
    private formSchemaCompiler: FormSchemaCompiler,
  ) {}

  public getFormSchemaByUuid(formUuid: string, cached: boolean = true): ReplaySubject<FormSchema> {
    const formSchema: ReplaySubject<any> = new ReplaySubject(1);
    const cachedCompiledSchema: any = this.getCachedCompiledSchemaByUuid(formUuid);
    if (cachedCompiledSchema && cached === true) {
      formSchema.next(cachedCompiledSchema);
    } else {
      this.getFormSchemaByUuidFromServer(formUuid).subscribe(
        (unCompiledSchema) => {
          const formSchema: any = unCompiledSchema.form;
          const referencedComponents: any = unCompiledSchema.referencedComponents;
          // add from metadata to the uncompiled schema
          this.formsResourceService.getFormMetaDataByUuid(formUuid).subscribe(
            (formMetadataObject: any) => {
              formMetadataObject.pages = formSchema.pages || [];
              formMetadataObject.referencedForms = formSchema.referencedForms || [];
              formMetadataObject.processor = formSchema.processor;
              // compile schema
              const compiledSchema: any = this.formSchemaCompiler.compileFormSchema(
                formMetadataObject,
                referencedComponents,
              );
              // now cache the compiled schema
              this.cacheCompiledSchemaByUuid(formUuid, compiledSchema);
              // return the compiled schema
              formSchema.next(compiledSchema);
            },
            (err) => {
              console.error(err);
              formSchema.error(err);
            },
          );
        },
        (err) => {
          console.error(err);
          formSchema.error(err);
        },
      );
    }
    return formSchema;
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
            this.formsResourceService.getFormClobDataByUuid(formMetadataObject.resources[0].valueReference).subscribe(
              (clobData: any) => {
                observer.next(clobData);
              },
              (err) => {
                console.error(err);
                observer.error(err);
              },
            );
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

  public static getUnlabeledConceptUuidsFromSchema(form: FormSchema): Array<string> {
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
