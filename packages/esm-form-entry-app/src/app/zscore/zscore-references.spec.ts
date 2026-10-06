import { FormSchema } from '../types';
import { loadZScoreReferences } from './zscore-references';
import wflGirlsBelow5 from './tables/wfl_girls_below5.json';

function buildSchema(calculateExpressions: Array<string>) {
  return {
    uuid: 'form-uuid',
    display: 'Test form',
    pages: [
      {
        label: 'Page',
        sections: [
          {
            label: 'Section',
            isExpanded: true,
            questions: calculateExpressions.map((calculateExpression, index) => ({
              id: `score${index}`,
              type: 'obs',
              questionOptions: { rendering: 'number', calculate: { calculateExpression } },
            })),
          },
        ],
      },
    ],
  } as unknown as FormSchema;
}

const allReferences = buildSchema([
  'calcWeightForHeightZscore(weightForHeightRef,height,weight)',
  'calcHeightForAgeZscore(heightForAgeRef,height,weight)',
  'calcBMIForAgeZscore(bmiForAgeRef,height,weight)',
]);

const referenceDate = new Date(2026, 9, 6);

describe('loadZScoreReferences', () => {
  it('returns no references for a form that does not use them', async () => {
    const schema = buildSchema(['height + weight']);

    expect(await loadZScoreReferences(schema, 'F', '2023-08-27', referenceDate)).toEqual({});
  });

  it('returns the weight-for-length table and the height-for-age row for the day of age for a child under 5', async () => {
    const references = await loadZScoreReferences(allReferences, 'F', '2023-08-27', referenceDate);

    expect(references.weightForHeightRef).toEqual(wflGirlsBelow5);
    expect(references.heightForAgeRef).toEqual([jasmine.objectContaining({ Day: 1136, SD0: 95.96 })]);
    expect(references.bmiForAgeRef).toBeNull();
  });

  it('returns the height-for-age and BMI-for-age rows for the month of age for a child aged 5 to 17', async () => {
    const references = await loadZScoreReferences(allReferences, 'M', '2018-08-27', referenceDate);

    expect(references.weightForHeightRef).toBeNull();
    expect(references.heightForAgeRef).toEqual([jasmine.objectContaining({ Month: 97, SD0: 127.713 })]);
    expect(references.bmiForAgeRef).toEqual([jasmine.objectContaining({ Month: 97, SD0: 15.761 })]);
  });

  it('only returns the references the form uses', async () => {
    const schema = buildSchema(['calcBMIForAgeZscore(bmiForAgeRef,height,weight)']);

    const references = await loadZScoreReferences(schema, 'M', '2018-08-27', referenceDate);

    expect(Object.keys(references)).toEqual(['bmiForAgeRef']);
  });

  it('returns null references when no reference data applies to the patient', async () => {
    const nullReferences = { weightForHeightRef: null, heightForAgeRef: null, bmiForAgeRef: null };

    expect(await loadZScoreReferences(allReferences, 'F', '2008-08-27', referenceDate)).toEqual(nullReferences);
    expect(await loadZScoreReferences(allReferences, 'U', '2023-08-27', referenceDate)).toEqual(nullReferences);
    expect(await loadZScoreReferences(allReferences, 'F', undefined, referenceDate)).toEqual(nullReferences);
  });
});
