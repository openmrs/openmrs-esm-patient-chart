import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, Subject, of, forkJoin, zip, from } from 'rxjs';
import { concat, first, map, take, tap } from 'rxjs/operators';

import { FormResourceService } from '../openmrs-api/form-resource.service';
import { FormSchemaCompiler } from '@openmrs/ngx-formentry';
import { SessionStorageService } from '../storage/session-storage.service';
import { FormMetadataObject, FormSchema, FormSchemaAndTranslations, Questions } from '../types';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'lodash-es';

@Injectable()
export class FormSchemaService {
  constructor(
    private formsResourceService: FormResourceService,
    private localStorage: SessionStorageService,
    private formSchemaCompiler: FormSchemaCompiler,
    private translateService: TranslateService,
  ) {}

  public getFormSchemaByUuid(
    formUuid: string,
    language: string = 'en',
    cached: boolean = true,
  ): Observable<FormSchema> {
    if (cached) {
      const cachedCompiledSchema = this.getCachedCompiledSchemaByUuid(formUuid, language);
      if (cachedCompiledSchema) {
        if (cachedCompiledSchema.translations) {
          this.translateService.setTranslation(language, cachedCompiledSchema.translations);
        }
        return of(cachedCompiledSchema);
      }
    }

    return forkJoin({
      unCompiledSchema: this.getFormSchemaByUuidFromServer(formUuid, language).pipe(take(1)),
      formMetadataObject: this.formsResourceService.getFormMetaDataByUuid(formUuid).pipe(take(1)),
    }).pipe(
      map(({ unCompiledSchema, formMetadataObject }) => {
        const formSchema = unCompiledSchema.form;
        const referencedComponents = unCompiledSchema.referencedComponents;

        const combinedFormMetadata = {
          ...formMetadataObject,
          pages: formSchema.pages || [],
          referencedForms: formSchema.referencedForms || [],
          processor: formSchema.processor,
          translations: {},
        };

        if (combinedFormMetadata.referencedForms.length > 0) {
          // use all translations from referenced forms, with the main form
          // "winning" any duplicates
          combinedFormMetadata.translations = merge(
            combinedFormMetadata.referencedForms.reduce(merge, {}),
            formSchema.translations ?? {},
          );
        } else {
          combinedFormMetadata.translations = formSchema.translations ?? {};
        }

        if (combinedFormMetadata.translations) {
          this.translateService.setTranslation(language, combinedFormMetadata.translations);
        }

        return this.formSchemaCompiler.compileFormSchema(
          combinedFormMetadata,
          referencedComponents,
        ) as unknown as FormSchema;
      }),
      tap((compiledSchema) => this.cacheCompiledSchema(formUuid, language, compiledSchema)),
    );
  }

  private getCachedCompiledSchemaByUuid(formUuid: string, language: string) {
    return this.localStorage.getObject(`form_${formUuid}_${language}`);
  }

  private cacheCompiledSchema(formUuid: string, language: string, schema: unknown) {
    this.localStorage.setObject(`form_${formUuid}_${language}`, schema);
  }

  private getFormSchemaByUuidFromServer(formUuid: string, language: string) {
    const formSchema: ReplaySubject<any> = new ReplaySubject(1);
    this.fetchFormSchemaUsingFormMetadata(formUuid, language).subscribe(
      ({ schema, translations }) => {
        schema.translations = translations;

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

  private fetchFormSchemaReferences(formSchema: FormSchema): Observable<any> {
    // first create the observableBatch/ArrayOfRequests
    const observableBatch: Array<Observable<FormSchemaAndTranslations>> = [];
    const referencedForms = formSchema.referencedForms;
    if (Array.isArray(referencedForms) && referencedForms.length > 0) {
      const referencedUuids: Array<string> = this.getFormUuidArray(referencedForms);
      referencedUuids.forEach((referencedUuid: any) => {
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

  private fetchFormSchemaUsingFormMetadata(
    formUuid: string,
    language: string = 'en',
  ): Observable<FormSchemaAndTranslations> {
    return Observable.create((observer: Subject<FormSchemaAndTranslations>) => {
      return this.formsResourceService.getFormMetaDataByUuid(formUuid).subscribe(
        (formMetadataObject: FormMetadataObject) => {
          if (formMetadataObject.resources.length > 0) {
            const { resources } = formMetadataObject;
            const schemaUuid = resources?.find(({ name }) => name === 'JSON schema')?.valueReference;
            const translationsUuid = resources?.find(({ name }) =>
              name.endsWith(`_translations_${language}`),
            )?.valueReference;

            const formSchema = new ReplaySubject<FormSchema>(1);
            if (schemaUuid) {
              this.formsResourceService.getFormClobDataByUuid(schemaUuid).subscribe(
                (clobData) => {
                  formSchema.next(clobData);
                },
                (err) => {
                  console.error(`Error while loading form ${formUuid}`, err);
                  formSchema.error(err);
                },
              );
            } else {
              formSchema.next();
            }

            const formTranslations = new ReplaySubject<Record<string, string>>(1);
            if (translationsUuid) {
              this.formsResourceService.getFormClobDataByUuid(translationsUuid).subscribe(
                (clobData) => {
                  formTranslations.next(clobData?.translations ?? {});
                },
                (err) => {
                  console.error(`Error while loading translations for ${formUuid} in ${language}`, err);
                  formTranslations.error(err);
                },
              );
            } else {
              formTranslations.next({});
            }

            zip(from(formSchema), from(formTranslations))
              .pipe(
                map(([schema, translations]) => ({
                  schema,
                  translations,
                })),
              )
              .subscribe((value) => observer.next(value));
          } else {
            observer.error(
              `${formMetadataObject.display}: The form ${formUuid} does not have any associated resources.`,
            );
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
        if (!question.label && typeof question.concept === 'string') {
          results.add(question.concept);
        }

        if (!question.label && typeof question.questionOptions?.concept === 'string') {
          results.add(question.questionOptions.concept);
        }

        for (const answer of question.questionOptions?.answers ?? []) {
          if (!answer.label && typeof answer.concept === 'string') {
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
