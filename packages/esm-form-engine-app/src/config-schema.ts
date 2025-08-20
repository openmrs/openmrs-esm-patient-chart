import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideUnansweredQuestionsInReadonlyForms: {
    _type: Type.Boolean,
    _description:
      'When enabled, unanswered questions will be hidden in read-only O3 forms (in embedded view) unless an explicit hide expression is defined.',
    _default: false,
  },
};

export interface ConfigObject {
  hideUnansweredQuestionsInReadonlyForms: boolean;
}
