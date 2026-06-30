import { Type } from '@openmrs/esm-framework';

export interface AllergiesConfigObject {
  concepts: {
    drugAllergenUuid: string;
    environmentalAllergenUuid: string;
    foodAllergenUuid: string;
    mildReactionUuid: string;
    moderateReactionUuid: string;
    severeReactionUuid: string;
    allergyReactionUuid: string;
    otherConceptUuid: string;
  };
  severityStyleMap: Record<string, 'high' | 'moderate' | 'low'>;
  enableSeverityBackgroundColoring: boolean;
}

export const configSchema = {
  concepts: {
    drugAllergenUuid: {
      _type: Type.ConceptUuid,
      _default: '162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    environmentalAllergenUuid: {
      _type: Type.ConceptUuid,
      _default: '162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    foodAllergenUuid: {
      _type: Type.ConceptUuid,
      _default: '162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    mildReactionUuid: {
      _type: Type.ConceptUuid,
      _default: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    moderateReactionUuid: {
      _type: Type.ConceptUuid,
      _default: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    severeReactionUuid: {
      _type: Type.ConceptUuid,
      _default: '1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    allergyReactionUuid: {
      _type: Type.ConceptUuid,
      _default: '162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    otherConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  severityStyleMap: {
    _type: Type.Object,
    _default: {
      severe: 'high',
      moderate: 'moderate',
      mild: 'low',
    },
  },
  enableSeverityBackgroundColoring: {
    _type: Type.Boolean,
    _default: false,
  },
};
