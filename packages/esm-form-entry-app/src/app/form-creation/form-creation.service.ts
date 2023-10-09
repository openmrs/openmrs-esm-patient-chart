import { DataSources, EncounterAdapter, Form, FormFactory, PatientIdentifierAdapter } from '@openmrs/ngx-formentry';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { ConfigResourceService } from '../services/config-resource.service';
import { MonthlyScheduleResourceService } from '../services/monthly-scheduled-resource.service';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { Encounter, FormSchema, Identifier } from '../types';
import { Session } from '@openmrs/esm-framework';
import { isFunction } from 'lodash-es';

/**
 * Data required for creating a {@link Form} instance.
 */
export interface CreateFormParams {
  /**
   * The form schema to be used.
   */
  formSchema: FormSchema;
  /**
   * The currently signed-in user.
   */
  session: Session;
  /**
   * An optional encounter.
   * If provided, this encounter will be edited by the form.
   * This can be an offline encounter form the sync queue which hasn't been synchronized yet.
   */
  encounter?: Encounter;
  /**
   * A previous encounter for displaying previously entered data.
   */
  previousEncounter?: Encounter;

  /**
   * Patient identifiers
   */
  patientIdentifiers: Array<Identifier>;
}

const loadedCustomDataSources: Record<string, unknown> = {};

/**
 * A service solely created for the {@link FeWrapperComponent}.
 * Its responsibility is to create the initial {@link Form} instance which, after creation, is rendered
 * by the form engine.
 * The creation of the form encompasses the following tasks:
 * 1) Hooking up the data sources used by the form engine.
 * 2) Setting up special node handling.
 * 3) Filling the form with either:
 * 3.1) default values for new forms (-> create mode).
 * 3.2) existing values from an existing encounter (-> edit mode).
 */
@Injectable()
export class FormCreationService {
  constructor(
    private readonly formFactory: FormFactory,
    private readonly dataSources: DataSources,
    private readonly formDataSourceService: FormDataSourceService,
    private readonly monthlyScheduleResourceService: MonthlyScheduleResourceService,
    private readonly encounterAdapter: EncounterAdapter,
    private readonly configResourceService: ConfigResourceService,
    private readonly singleSpaPropsService: SingleSpaPropsService,
    private readonly patientIdentifierAdapter: PatientIdentifierAdapter,
  ) {}

  /**
   * Initializes a new {@link Form} using the given values.
   * The form can then be rendered by the form engine.
   * @param createFormParams Data used for building the initial form.
   * @returns The new {@link Form} instance.
   */
  public async initAndCreateForm(createFormParams: CreateFormParams) {
    const { formSchema, encounter, patientIdentifiers } = createFormParams;

    await this.wireDataSources(createFormParams, formSchema);

    const form = this.formFactory.createForm(formSchema, this.dataSources.dataSources);
    this.setUpWHOCascading(form);

    if (patientIdentifiers) {
      this.patientIdentifierAdapter.populateForm(form, patientIdentifiers);
    }
    if (encounter) {
      const encounterUuid = encounter.uuid;
      this.populateEncounterForEditing(form, createFormParams);
      form.valueProcessingInfo.encounterUuid = encounterUuid;
    } else {
      const patientUuid = this.singleSpaPropsService.getPropOrThrow('patientUuid');
      this.setDefaultValues(form, createFormParams);
      form.valueProcessingInfo.patientUuid = patientUuid;
    }

    this.setUpPayloadProcessingInformation(form, createFormParams);

    return form;
  }

  private async wireDataSources(createFormParams: CreateFormParams, formSchema: FormSchema) {
    const visitTypeUuid = this.singleSpaPropsService.getPropOrThrow('visitTypeUuid');
    const patient = this.singleSpaPropsService.getPropOrThrow('patient');

    // Clear any previously configured data sources.
    // Reason: If a config value changes in between two invocations, that data source would otherwise stick
    // until the page is refreshed (all other data sources would be overridden as expected).
    for (const dataSourceKey of Object.keys(this.dataSources.dataSources)) {
      this.dataSources.clearDataSource(dataSourceKey);
    }

    // Fixed data sources which are always required.
    // We re-register them during each form creation flow because props like the logged-in user or patient
    // can change in between.
    const dataSources = this.formDataSourceService.getDataSources(formSchema);
    this.dataSources.registerDataSource('location', dataSources.location);
    this.dataSources.registerDataSource('provider', dataSources.provider);
    this.dataSources.registerDataSource('drug', dataSources.drug);
    this.dataSources.registerDataSource('problem', dataSources.problem);
    this.dataSources.registerDataSource('personAttribute', dataSources.location);
    this.dataSources.registerDataSource('conceptAnswers', dataSources.conceptAnswers);
    this.dataSources.registerDataSource('diagnoses', dataSources.diagnoses);
    this.dataSources.registerDataSource('patient', { visitTypeUuid }, true);
    const patientObj = this.formDataSourceService.getPatientObject(patient);
    this.dataSources.registerDataSource('patient', patientObj, true);
    this.dataSources.registerDataSource('rawPrevEnc', createFormParams.previousEncounter, false);
    const rawPrevObs = await dataSources.recentObs(patient.id);
    this.dataSources.registerDataSource('rawPrevObs', rawPrevObs, false);
    this.dataSources.registerDataSource('userLocation', createFormParams.session.sessionLocation);

    // TODO monthlySchedule should be converted to a "standard" configurableDataSource
    const config = this.configResourceService.getConfig();
    if (config.dataSources.monthlySchedule) {
      this.dataSources.registerDataSource('monthlyScheduleResourceService', this.monthlyScheduleResourceService);
    }

    // Load configurable data sources which are configurable.
    return Promise.all([
      config.customDataSources.map(async ({ name, moduleName, moduleExport }) => {
        let silent = false;
        // for now, these data sources are not reloaded between runs
        if (loadedCustomDataSources.hasOwnProperty(name)) {
          const module = loadedCustomDataSources[name];
          if (module) {
            this.dataSources.registerDataSource(name, loadedCustomDataSources[name]);
            return Promise.resolve();
          } else {
            // if module is not defined at this point, an error would've been logged the first time it was loaded
            silent = true;
          }
        }

        if (moduleName === '') {
          if (!silent) {
            console.warn(
              `A custom data source ${name} has a blank module name. A module name must be provided to register a data source correctly.`,
            );
          }
          loadedCustomDataSources[name] = undefined;
          return Promise.resolve();
        }

        const slug = slugify(moduleName);
        if (window.hasOwnProperty(slug)) {
          const moduleEntry: Record<string, unknown> = window[slug] as unknown as Record<string, unknown>;
          if (
            !(typeof moduleEntry === 'object') ||
            !moduleEntry.hasOwnProperty('init') ||
            !isFunction(moduleEntry.init) ||
            !moduleEntry.hasOwnProperty('get') ||
            !isFunction(moduleEntry.get)
          ) {
            if (!silent) {
              console.error(
                `esm-form-app is configured to use the datasource ${name} from the module ${moduleName}, but the version of ${moduleName} loaded is not in the expected format. Please ensure that the version of ${moduleName} you are loading is built as a Webpack module.`,
              );
            }
            loadedCustomDataSources[name] = undefined;
            return Promise.resolve();
          }

          try {
            const factory: () => Record<string, unknown> = await moduleEntry.get('./start');
            const module = factory();

            if (!(typeof module === 'object') || !module.hasOwnProperty(moduleExport)) {
              if (!silent) {
                console.error(
                  `esm-form-entry-app could not load the module ${moduleName} for the datasource ${name} because the module did not have the expected ${
                    moduleExport == 'default' ? 'default export' : `export ${moduleExport}`
                  }.`,
                );
              }
              loadedCustomDataSources[name] = undefined;
              return Promise.resolve();
            }

            loadedCustomDataSources[name] = module[moduleExport];
            this.dataSources.registerDataSource(name, module[moduleExport]);
            return Promise.resolve();
          } catch (e) {
            if (!silent) {
              console.error(
                `esm-form-entry-app could not load the datasource ${name} because ${moduleName} did not export the expected entry "./start". Please check the Webpack configuration for ${moduleName}.`,
                e,
              );
            }
            loadedCustomDataSources[name] = undefined;
            return Promise.resolve();
          }
        } else {
          if (!silent) {
            console.error(
              `esm-form-entry-app is configured to use the datasource ${name}, but the corresponding module ${moduleName} has not been loaded. Most likely, this means that ${moduleName} is not in your importmap or was not loaded prior to ending up here.`,
            );
          }
          loadedCustomDataSources[name] = undefined;
          return Promise.resolve();
        }
      }),
    ]);
  }

  private setUpWHOCascading(form: Form) {
    try {
      let whoQuestions = form.searchNodeByQuestionId('adultWhoStage');
      if (whoQuestions.length === 0) {
        whoQuestions = form.searchNodeByQuestionId('pedWhoStage');
      }

      const whoStageQuestion = whoQuestions[0];
      whoStageQuestion?.control.valueChanges.subscribe((val) => {
        // TODO: This `subscribe` leaks once a new form is created. Should be disposed eventually.
        if (val) {
          const source = form.dataSourcesContainer.dataSources['conceptAnswers'];
          source.changeConcept?.(val);
        }
      });
    } catch (error) {
      // TODO: This catch swallows the error. I left it in place, but we should ensure that the form
      // remains functional if this is not setup correctly (and rethrow otherwise).
      console.error(`Error setting up WHO Staging Cascading. Error: ${JSON.stringify(error)}.`);
    }
  }

  private setDefaultValues(form: Form, createFormParams: CreateFormParams) {
    const { session } = createFormParams;
    let currentDate = dayjs().format();
    const visitStartDatetime = dayjs(this.singleSpaPropsService.getProp('visitStartDatetime')).format();
    // If the visit start date is before the current date, use the visit start date as the default date.
    if (visitStartDatetime && dayjs(visitStartDatetime).isBefore(currentDate, 'date')) {
      currentDate = visitStartDatetime;
    }
    // Encounter date and time.
    const encounterDate = form.searchNodeByQuestionId('encDate');
    if (encounterDate.length > 0) {
      encounterDate[0].control.setValue(currentDate);
    }

    // User location.
    const encounterLocation = form.searchNodeByQuestionId('location', 'encounterLocation');
    if (encounterLocation.length > 0 && session?.sessionLocation) {
      encounterLocation[0].control.setValue(session.sessionLocation.uuid);
    }

    // Provider.
    const encounterProvider = form.searchNodeByQuestionId('provider', 'encounterProvider');
    if (encounterProvider.length > 0 && session?.currentProvider) {
      encounterProvider[0].control.setValue(session.currentProvider.uuid);
    }
  }

  private setUpPayloadProcessingInformation(form: Form, createFormParams: CreateFormParams) {
    const { session, formSchema, encounter } = createFormParams;
    const patientUuid = this.singleSpaPropsService.getPropOrThrow('patientUuid');
    const visitUuid = this.singleSpaPropsService.getPropOrThrow('visitUuid');
    const formUuid = this.singleSpaPropsService.getPropOrThrow('formUuid');

    try {
      if (session) {
        form.valueProcessingInfo.personUuid = patientUuid;
        form.valueProcessingInfo.patientUuid = patientUuid;
        form.valueProcessingInfo.formUuid = formUuid;
        form.valueProcessingInfo.providerUuid = session.currentProvider?.uuid;

        if (formSchema.encounterType) {
          form.valueProcessingInfo.encounterTypeUuid = formSchema.encounterType.uuid;
        } else {
          throw new Error('Please associate the form with an encounter type.');
        }

        if (encounter) {
          form.valueProcessingInfo.encounterUuid = encounter.uuid;
        }

        // The visit UUID seems to not be required when starting with an encounter
        // (probably because the encounter is already associated with a visit).
        if (!encounter) {
          form.valueProcessingInfo.visitUuid = visitUuid;
        }
      }
    } catch (error) {
      // TODO: This catch swallows the error. I left it in place, but we should ensure that the form
      // remains functional if this is not setup correctly (and rethrow otherwise).
      console.error(error);
    }
  }

  private populateEncounterForEditing(form: Form, createFormParams: CreateFormParams) {
    const { encounter } = createFormParams;

    if (encounter) {
      this.encounterAdapter.populateForm(form, encounter);
    }
  }
}

function slugify(name) {
  return name.replace(/[\/\-@]/g, '_');
}
