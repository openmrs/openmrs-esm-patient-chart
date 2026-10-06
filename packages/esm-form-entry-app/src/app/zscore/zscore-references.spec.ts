import { FormSchema } from '../types';
import { loadZScoreReferences } from './zscore-references';
import bfaBoys5Above from './tables/bfa_boys_5_above.json';
import bfaGirls5Above from './tables/bfa_girls_5_above.json';
import hfaBoys5Above from './tables/hfa_boys_5_above.json';
import hfaBoysBelow5 from './tables/hfa_boys_below5.json';
import hfaGirls5Above from './tables/hfa_girls_5_above.json';
import hfaGirlsBelow5 from './tables/hfa_girls_below5.json';
import wflBoysBelow5 from './tables/wfl_boys_below5.json';
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

  it("returns the girls' height-for-age row for a girl aged 5 to 17", async () => {
    const references = await loadZScoreReferences(allReferences, 'F', '2018-08-27', referenceDate);

    expect(references.heightForAgeRef).toEqual([jasmine.objectContaining({ Month: 97, SD0: 127.042 })]);
  });

  it('returns the under-5 height-for-age row and no BMI-for-age reference in the month after the fifth birthday', async () => {
    const references = await loadZScoreReferences(allReferences, 'F', '2021-09-20', referenceDate);

    expect(references.weightForHeightRef).toBeNull();
    expect(references.heightForAgeRef).toEqual([jasmine.objectContaining({ Day: 1842, SD0: 109.695 })]);
    expect(references.bmiForAgeRef).toBeNull();
  });

  it('returns the month 61 rows for a child past the under-5 tables who is a day short of 61 months', async () => {
    // 1,857 days after 1 March 2015 is 31 March 2020, which is still 60 completed months
    const references = await loadZScoreReferences(allReferences, 'F', '2015-03-01', new Date(2020, 2, 31));

    expect(references.heightForAgeRef).toEqual([jasmine.objectContaining({ Month: 61, SD0: 109.602 })]);
    expect(references.bmiForAgeRef).toEqual([jasmine.objectContaining({ Month: 61, SD0: 15.244 })]);
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

describe('WHO reference tables', () => {
  it('has a different table for girls and boys for each reference', () => {
    expect(wflGirlsBelow5).not.toEqual(wflBoysBelow5);
    expect(hfaGirlsBelow5).not.toEqual(hfaBoysBelow5);
    expect(hfaGirls5Above).not.toEqual(hfaBoys5Above);
    expect(bfaGirls5Above).not.toEqual(bfaBoys5Above);
  });

  it("matches the medians in WHO's height-for-age tables for 5 to 19 years", () => {
    const median = (table: Array<Record<string, number>>, month: number) =>
      table.find((row) => row.Month === month).SD0;

    // The M column of WHO's Growth Reference 2007 height-for-age z-score tables
    expect(median(hfaGirls5Above, 61)).toBeCloseTo(109.6016, 3);
    expect(median(hfaGirls5Above, 228)).toBeCloseTo(163.1548, 3);
    expect(median(hfaBoys5Above, 61)).toBeCloseTo(110.2647, 3);
    expect(median(hfaBoys5Above, 228)).toBeCloseTo(176.5432, 3);
  });
});
