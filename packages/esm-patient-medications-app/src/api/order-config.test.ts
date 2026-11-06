import { describe, expect, it } from 'vitest';
import { findDaysDurationUnit, type CommonConfigProps } from './order-config';

function unit(code = '258703001', source = 'SCT', mapType = '35543629-7d8c-11e1-909d-c80aa9edcf4e'): CommonConfigProps {
  return {
    uuid: 'local-days-uuid',
    display: 'Local days label',
    mappings: [
      {
        conceptMapType: { uuid: mapType },
        conceptReferenceTerm: { code, conceptSource: { hl7Code: source } },
      },
    ],
  };
}

describe('findDaysDurationUnit', () => {
  it('selects the backend concept by its SAME-AS SNOMED mapping', () => {
    const days = unit();
    expect(findDaysDurationUnit([unit('258705008'), days])).toBe(days);
  });

  it.each([
    ['same code in another source', unit('258703001', 'CIEL')],
    ['non-equivalent mapping', unit('258703001', 'SCT', 'narrower-than')],
    ['UCUM-only days', unit('d', 'UCUM')],
    ['unknown code', unit('unknown')],
    ['missing mappings', { uuid: 'unmapped', display: 'Days' }],
    ['incomplete mapping', { uuid: 'partial', display: 'Days', mappings: [{}] }],
  ])('does not infer days from %s', (_label, candidate) => {
    expect(findDaysDurationUnit([candidate as CommonConfigProps])).toBeUndefined();
  });

  it('handles absent and empty duration units', () => {
    expect(findDaysDurationUnit()).toBeUndefined();
    expect(findDaysDurationUnit([])).toBeUndefined();
  });

  it('examines mappings after an unrelated mapping', () => {
    const days = unit();
    days.mappings.unshift(...unit('258705008').mappings);
    expect(findDaysDurationUnit([days])).toBe(days);
  });
});
