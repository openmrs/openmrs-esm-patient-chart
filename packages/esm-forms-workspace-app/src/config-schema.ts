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
    _default: undefined,
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
    _default: false,
  },
  orderFormsByName: {
    _type: Type.Boolean,
    _description: 'Order the forms alphabetically.',
    _default: true,
  },
};

export interface FormsSectionConfig {
  name: string;
  labelCode: string;
  forms?: Array<{
    name: string;
    uuid: string;
  }>;
}

export interface ConfigObject {
  formsSectionsConfig?: Array<FormsSectionConfig>;
  showRecommendedFormsTab: boolean;
  customFormsUrl: string;
  showConfigurableForms: boolean;
  showHtmlFormEntryForms: boolean;
  useCurrentVisitDates: boolean;
  orderFormsByName: boolean;
}
