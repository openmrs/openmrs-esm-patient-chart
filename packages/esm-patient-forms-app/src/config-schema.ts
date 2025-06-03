import { validator, Type } from '@openmrs/esm-framework';
import { type HtmlFormEntryForm } from '@openmrs/esm-patient-common-lib';

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
            (v: unknown) =>
              typeof v === 'string' && (v === 'enterHtmlFormWithStandardUi' || v === 'enterHtmlFormWithSimpleUi'),
            'Must be one of "enterHtmlFormWithStandardUi" or "enterHtmlFormWithSimpleUi"',
          ),
        ],
      },
      formEditUiPage: {
        _type: Type.String,
        _description:
          'The HTMLFormEntry page to use to edit this form. Should be one of "editHtmlFormWithStandardUi" or "editHtmlFormWithSimpleUi"',
        _validators: [
          validator(
            (v: unknown) =>
              typeof v === 'string' && (v === 'editHtmlFormWithStandardUi' || v === 'editHtmlFormWithSimpleUi'),
            'Must be one of "editHtmlFormWithStandardUi" or "editHtmlFormWithSimpleUi"',
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
        formEditUiPage: 'editHtmlFormWithStandardUi',
      },
      {
        formUuid: 'b5f8ffd8-fbde-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Discharge (Simple)',
        formUiResource: 'referenceapplication:htmlforms/simpleDischarge.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
        formEditUiPage: 'editHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a007bbfe-fbe5-11e2-8ff2-fd54ab5fdb2a',
        formName: 'Transfer Within Hospital (Simple)',
        formUiResource: 'referenceapplication:htmlforms/simpleTransfer.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
        formEditUiPage: 'editHtmlFormWithStandardUi',
      },
      {
        formUuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
        formName: 'Visit Note',
        formUiResource: 'referenceapplication:htmlforms/simpleVisitNote.xml',
        formUiPage: 'enterHtmlFormWithStandardUi',
        formEditUiPage: 'editHtmlFormWithStandardUi',
      },
      {
        formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
        formName: 'Vitals',
        formUiResource: 'referenceapplication:htmlforms/vitals.xml',
        formUiPage: 'enterHtmlFormWithSimpleUi',
        formEditUiPage: 'editHtmlFormWithSimpleUi',
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
  orderBy: {
    _type: Type.String,
    _description:
      'Describes how forms should be ordered. Set to "name" to order forms alphabetically by name or "most-recent" to order forms by the most recently filled-in.',
    _default: 'name',
    _validators: [
      validator(
        (s: unknown) => typeof s === 'string' && (s === 'name' || s === 'most-recent'),
        "orderBy must be either 'name' or 'most-recent'",
      ),
    ],
  },
  formSections: {
    _type: Type.Array,
    _elements: {
      name: {
        _type: Type.String,
        _description: 'Name of the section. Also used as a label for translations.',
        _validators: [
          validator((v: unknown) => typeof v === 'string' && v.trim() !== '', 'Each form section must have a name.'),
        ],
      },
      forms: {
        _type: Type.Array,
        _description:
          'List of forms to be included in this section. Each form should be specified as a form name or UUID.',
        _elements: {
          _type: Type.String,
          _description: 'Name or UUID of form to be included in the section',
          _validators: [
            validator(
              (v: unknown) => typeof v === 'string' && v.trim() !== '',
              'Each form must be specified by name or UUID.',
            ),
          ],
        },
        _default: [],
      },
    },
    _default: [],
  },
};

export interface FormsSection {
  name: string;
  forms: Array<string>;
}

export interface ConfigObject {
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  formSections: Array<FormsSection>;
  customFormsUrl: string;
  orderBy: 'name' | 'most-recent';
  showHtmlFormEntryForms: boolean;
}
