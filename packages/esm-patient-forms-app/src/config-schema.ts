import { validator, Type } from '@openmrs/esm-framework';

export const configSchema = {
  htmlFormEntryForms: {
    _type: Type.Array,
    _elements: {
      formUuid: {
        _type: Type.UUID,
        _description: 'The UUID of the form',
      },
      formName: {
        _type: Type.String,
        _description: 'The name of the form',
      },
      formAppUrl: {
        _type: Type.String,
        _description: 'The name of the XML file that defines the form',
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
        formAppUrl: 'simpleAdmission',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'b5f8ffd8-fbde-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Discharge (Simple)',
        formAppUrl: 'simpleDischarge',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a007bbfe-fbe5-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Transfer Within Hospital (Simple)',
        formAppUrl: 'simpleTransfer',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
        formName: 'Visit Note',
        formAppUrl: 'simpleVisitNote',
        formUiPage: 'enterHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
        formName: 'Vitals',
        formAppUrl: 'vitals',
        formUiPage: 'enterHtmlFormWithSimpleUi',
      },
    ],
  },
  displayPOCForms: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Determines whether to display POC Forms only filtering out html forms',
  },
};

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formAppUrl: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export interface ConfigObject {
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
}
