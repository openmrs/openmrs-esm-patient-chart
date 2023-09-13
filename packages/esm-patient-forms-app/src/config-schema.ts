import { validator, Type } from '@openmrs/esm-framework';

export const configSchema = {
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
  customFormsUrl: {
    _type: Type.String,
    _description: 'Custom forms endpoint to fetch forms using a custom url.',
    _default: '',
  },
  orderFormsByName: {
    _type: Type.Boolean,
    _description: 'Order forms alphabetically.',
    _default: true,
  },
};

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export interface ConfigObject {
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  customFormsUrl: string;
  orderFormsByName: boolean;
  showHtmlFormEntryForms: boolean;
}
