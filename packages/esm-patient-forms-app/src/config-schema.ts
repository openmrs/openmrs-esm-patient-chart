import { validator, Type } from '@openmrs/esm-framework';

export const configSchema = {
  formsSectionsConfig: {
    _type: Type.Array,
    _elements: {
      name: {
        _type: Type.String,
        _description: 'Name of the section.',
      },
      labelCode: {
        _type: Type.String,
        _description: 'Label to be used to translate the section.',
      },
      forms: {
        _type: Type.Array,
        _description:
          'List of forms that should be associated with this section, it can be used the `Form UUID` or the `Encounter Type UUID` if you have both the `Form UUID` will be used.',
        _elements: {
          formUuid: {
            _type: Type.String,
            _description: 'Uuid of the form.',
          },
          encounterTypeUuid: {
            _type: Type.String,
            _description: 'Uuid of the encounter type.',
          },
        },
      },
    },
    _default: [],
  },
  htmlFormEntryForms: {
    _type: Type.Array,
    _elements: {
      formUuid: {
        _type: Type.String,
        _description: 'The UUID of the form',
      },
      formName: {
        _type: Type.String,
        _description: 'The name of the form',
      },
      formUiResource: {
        _type: Type.String,
        _description:
          'The resource file that defines the form. For example "referenceapplication:htmlforms/vitals.xml"',
      },
      formUiPage: {
        _type: Type.String,
        _description:
          'The HTMLFormEntry page to use to show this form. Should be one of "enterHtmlFormWithStandardUi" or "enterHtmlFormWithSimpleUi"',
        _validators: [
          validator(
            (p) => p === 'enterHtmlFormWithStandardUi' || p === 'enterHtmlFormWithSimpleUi',
            'Must be one of "enterHtmlFormWithStandardUi" or "enterHtmlFormWithSimpleUi"',
          ),
        ],
      },
    },
    _default: [
      {
        formUuid: 'd2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Admission (Simple)',
        formUiResource: 'referenceapplication:htmlforms/simpleAdmission.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'b5f8ffd8-fbde-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Discharge (Simple)',
        formUiResource: 'referenceapplication:htmlforms/simpleDischarge.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a007bbfe-fbe5-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Transfer Within Hospital (Simple)',
        formUiResource: 'referenceapplication:htmlforms/simpleTransfer.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
        formName: 'Visit Note',
        formUiResource: 'referenceapplication:htmlforms/simpleVisitNote.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
        formName: 'Vitals',
        formUiResource: 'referenceapplication:htmlforms/vitals.xml',
        formUiPage: 'enterHtmlFormWithSimpleUi',
      },
    ],
  },
  showHtmlFormEntryForms: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether HTML Form Entry forms should be included in lists of forms.',
  },
  showRecommendedFormsTab: {
    _type: Type.Boolean,
    _description: 'Whether to display recommended forms tab. Requires AMPATH ETL.',
    _default: false,
  },
  customFormsUrl: {
    _type: Type.String,
    _description: 'Custom forms endpoint to fetch forms using a custom url need `showConfigurableForms`',
    _default: '',
  },
  useCurrentVisitDates: {
    _type: Type.Boolean,
    _description: 'Only load encounters inside of the current visit.',
    _default: false,
  },
  orderBy: {
    _type: Type.String,
    _description:
      'Accept the values `name` that will order the forms alphabetically and `most-recent` that will order by the most recent created forms.',
    _default: 'most-recent',
    _validators: [
      validator((s) => s === 'name' || s === 'most-recent', "orderBy must be either 'name' or 'most-recent'"),
    ],
  },
};

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export interface FormsSectionConfig {
  name: string;
  labelCode: string;
  forms?: Array<{
    formUuid?: string;
    encounterTypeUuid?: string;
  }>;
}

export interface ConfigObject {
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  formsSectionsConfig?: Array<FormsSectionConfig>;
  showRecommendedFormsTab: boolean;
  customFormsUrl: string;
  showHtmlFormEntryForms: boolean;
  useCurrentVisitDates: boolean;
  orderBy?: OrderBy;
}

export enum OrderBy {
  Name = 'name',
  MostRecent = 'most-recent',
}
