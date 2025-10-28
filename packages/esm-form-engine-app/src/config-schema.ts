import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  hideUnansweredQuestionsInReadonlyForms: {
    _type: Type.Boolean,
    _description:
      'Controls whether empty fields are hidden in embedded readonly forms. When true, empty non-transient fields are hidden when forms are displayed in embedded-view mode (e.g., in the Visit dashboard Encounters widget).',
    _default: false,
  },
  phq9Concepts: {
    _type: Type.Object,
    _description: 'PHQ-9 concept UUIDs for score calculation',
    _default: {
      notAtAll: '160215AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Not at all
      severalDays: '167000AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Several days
      moreThanHalf: '167001AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // More than half
      nearlyEveryDay: '167002AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Nearly every day
    },
  },
};

export interface ConfigObject {
  hideUnansweredQuestionsInReadonlyForms: boolean;
  phq9Concepts: {
    notAtAll: string;
    severalDays: string;
    moreThanHalf: string;
    nearlyEveryDay: string;
  };
}
