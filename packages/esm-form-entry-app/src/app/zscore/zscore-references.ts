import moment from 'moment';
import { FormSchema } from '../types';

export type ZScoreTable = Array<Record<string, number>>;

/**
 * The names the z-score helpers' reference data is passed under in form schemas,
 * e.g. `calcBMIForAgeZscore(bmiForAgeRef, height, weight)`.
 */
const referenceNames = ['weightForHeightRef', 'heightForAgeRef', 'bmiForAgeRef'] as const;

export type ZScoreReferenceName = (typeof referenceNames)[number];

/**
 * The WHO reference tables come to about 1.3 MB of JSON, so each one is loaded only for a form and patient
 * that need it.
 */
const tableLoaders = {
  wfl_girls_below5: () => import('./tables/wfl_girls_below5.json'),
  wfl_boys_below5: () => import('./tables/wfl_boys_below5.json'),
  hfa_girls_below5: () => import('./tables/hfa_girls_below5.json'),
  hfa_boys_below5: () => import('./tables/hfa_boys_below5.json'),
  hfa_girls_5_above: () => import('./tables/hfa_girls_5_above.json'),
  hfa_boys_5_above: () => import('./tables/hfa_boys_5_above.json'),
  bfa_girls_5_above: () => import('./tables/bfa_girls_5_above.json'),
  bfa_boys_5_above: () => import('./tables/bfa_boys_5_above.json'),
};

type ZScoreTableName = keyof typeof tableLoaders;

/**
 * Loads the WHO reference data for each z-score reference the form schema mentions, chosen by the patient's sex
 * and age the same way as AMPATH's ng2-amrs. A reference that doesn't apply to the patient is `null`, which the
 * z-score helpers handle. Each mentioned reference must be registered, even as `null`, because the expression
 * runner treats an expression that refers to an unregistered name as failed and sets the field to `false`.
 */
export async function loadZScoreReferences(
  formSchema: FormSchema,
  sex: string | undefined,
  birthDate: string | undefined,
  referenceDate: Date = new Date(),
): Promise<Partial<Record<ZScoreReferenceName, ZScoreTable | null>>> {
  const schema = JSON.stringify(formSchema ?? {});
  const usedReferences = referenceNames.filter((name) => schema.includes(name));
  const references: Partial<Record<ZScoreReferenceName, ZScoreTable | null>> = {};

  await Promise.all(
    usedReferences.map(async (name) => {
      references[name] = await loadReference(name, sex, birthDate, referenceDate);
    }),
  );

  return references;
}

async function loadReference(
  name: ZScoreReferenceName,
  sex: string | undefined,
  birthDate: string | undefined,
  referenceDate: Date,
): Promise<ZScoreTable | null> {
  const children = sex === 'F' ? 'girls' : sex === 'M' ? 'boys' : null;
  if (!children || !birthDate) {
    return null;
  }

  const birth = moment(birthDate);
  const today = moment(referenceDate);
  const age = today.diff(birth, 'years');
  const ageInMonths = today.diff(birth, 'months');
  const ageInDays = today.diff(birth, 'days');

  switch (name) {
    case 'weightForHeightRef':
      return age < 5 ? loadTable(`wfl_${children}_below5`) : null;
    case 'heightForAgeRef':
      if (age < 5) {
        return rowsFor(await loadTable(`hfa_${children}_below5`), 'Day', ageInDays);
      }
      return age < 18 ? rowsFor(await loadTable(`hfa_${children}_5_above`), 'Month', ageInMonths) : null;
    case 'bmiForAgeRef':
      return age >= 5 && age < 18 ? rowsFor(await loadTable(`bfa_${children}_5_above`), 'Month', ageInMonths) : null;
  }
}

async function loadTable(name: ZScoreTableName): Promise<ZScoreTable> {
  const table = await tableLoaders[name]();
  return table.default;
}

function rowsFor(table: ZScoreTable, key: string, value: number): ZScoreTable {
  return table.filter((row) => row[key] === value);
}
