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
        _description: 'Configuration of the forms.',
        _elements: {
          name: {
            _type: Type.String,
            _description: 'Name of form.',
          },
          encounterTypeUuid: {
            _type: Type.String,
            _description: 'Uuid fo the encounter type.',
          },
        },
      },
    },
    //_default: undefined,
    _default: [
      {
        name: 'ICRC Forms',
        labelCode: 'icrcForms',
        forms: [
          {
            name: 'Assessment Form',
            encounterTypeUuid: '0c63150d-ff39-42e1-9048-834mh76p2s72',
          },
          {
            name: 'Follow up Form',
            encounterTypeUuid: '07a7dd1c-7280-483a-a3bc-01be995293ac',
          },
          {
            name: 'Closure Form',
            encounterTypeUuid: '95458795-3o06-4l59-9508-c217aa21ea26',
          },
        ],
      },
      {
        name: 'Distress Scales',
        labelCode: 'distressScales',
        forms: [
          {
            name: 'DASS-21',
            encounterTypeUuid: '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
          },
          {
            name: 'CRIES-8',
            encounterTypeUuid: '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
          },
          {
            name: 'CRIES-13',
            encounterTypeUuid: '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
          },
          {
            name: 'IES-R',
            encounterTypeUuid: '790a93a8-fff6-49af-f98d-2e9f436f93a8',
          },
        ],
      },
      {
        name: 'Functioning scales',
        labelCode: 'functioningScales',
        forms: [
          {
            name: 'WHODAS 2.0',
            encounterTypeUuid: '6c39d93d-73c2-4388-whod-asf80508064b',
          },
          {
            name: 'PROQOL',
            encounterTypeUuid: '805f55bb-5f5c-475d-bd71-e9553d38bde9',
          },
          {
            name: 'SRQ-20',
            encounterTypeUuid: '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
          },
          {
            name: 'Functionality scale - Africa',
            encounterTypeUuid: '6d9df509-a22f-48aa-8a94-fc72ded71acc',
          },
          {
            name: 'Functionality scale - Asia',
            encounterTypeUuid: 'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
          },
        ],
      },
      {
        name: 'Coping Scales',
        labelCode: 'copingScales',
        forms: [
          {
            name: 'BRIEF Cope',
            encounterTypeUuid: '83458695-3b06-4d59-9508-d217aa21ea26',
          },
        ],
      },
    ],
  },
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
  showConfigurableForms: {
    _type: Type.Boolean,
    _description: 'Whether to use customURL to fetch forms, works with `customFormsUrl`',
    _default: false,
  },
  customFormsUrl: {
    _type: Type.String,
    _description: 'Custom forms endpoint to fetch forms using a custom url need `showConfigurableForms`',
    _default: '',
  },
  useCurrentVisitDates: {
    _type: Type.Boolean,
    _description: 'Only load encounters inside of the current visits dated.',
    _default: true,
  },
  orderFormsByName: {
    _type: Type.Boolean,
    _description: 'Order the forms alphabetically.',
    _default: false,
  },
};

export interface FormsSectionConfig {
  name: string;
  labelCode: string;
  forms?: Array<{
    name: string;
    encounterTypeUuid: string;
  }>;
}

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export interface ConfigObject {
  formsSectionsConfig?: Array<FormsSectionConfig>;
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  showRecommendedFormsTab: boolean;
  customFormsUrl: string;
  showConfigurableForms: boolean;
  showHtmlFormEntryForms: boolean;
  useCurrentVisitDates: boolean;
  orderFormsByName: boolean;
}
