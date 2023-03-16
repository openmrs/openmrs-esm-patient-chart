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
        _description: 'List of forms that should be associated with this section',
        _elements: {
          name: {
            _type: Type.String,
            _description: 'Name of form.',
          },
          uuid: {
            _type: Type.String,
            _description: 'Uuid of the form.',
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
    _description: 'Whether to display recommended forms tab.',
    _default: false,
  },
  customFormsUrl: {
    _type: Type.String,
    _description: 'Custom forms endpoint to fetch forms using a custom url.',
    _default: '',
  },
  useCurrentVisitDates: {
    _type: Type.Boolean,
    _description: 'Only load encounters inside of the current visits dated.',
    _default: false,
  },
  orderBy: {
    _type: Type.String,
    _description:
      'Accept the values `name` that will order the forms alphabetically and `most-recent` that will order by the most recent created forms.',
    _default: 'most-recent',
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
  showHtmlFormEntryForms: boolean;
  useCurrentVisitDates: boolean;
  orderBy?: OrderBy;
}

export enum OrderBy {
  Name = 'name',
  MostRecent = 'most-recent',
}
