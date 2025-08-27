import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideUnansweredQuestionsInReadonlyForms: {
    _type: Type.Boolean,
    _description:
      'Controls whether empty fields are hidden in embedded readonly forms. When true, empty non-transient fields are hidden when forms are displayed in embedded-view mode (e.g., in the Visit dashboard Encounters widget).',
    _default: false,
  },
};

export interface ConfigObject {
  hideUnansweredQuestionsInReadonlyForms: boolean;
}
