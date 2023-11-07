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
}
export const configSchema = {
  concepts: {
    allergenUuid: {
      _type: Type.ConceptUuid,
      _default: '493a20d1-345a-407c-ba34-345050fa5538',
    },
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
};
