import { describe, it, expect } from 'vitest';
import { getMuacColorCode } from './vitals-biometrics-form.utils';

describe('getMuacColorCode', () => {
  it('classifies a 5-year-old with MUAC 13.0cm as SAM (red), per the 5-<10y bracket', () => {
    let result = '';
    getMuacColorCode(5, 13.0, (color) => {
      result = color;
    });
    expect(result).toBe('red');
  });

  it('sets a color code for a 10-year-old (age boundary)', () => {
    let result = '';
    getMuacColorCode(10, 17.0, (color) => {
      result = color;
    });
    expect(result).toBe('yellow');
  });

  it('sets a color code for a 15-year-old (age boundary)', () => {
    let result = '';
    getMuacColorCode(15, 20.0, (color) => {
      result = color;
    });
    expect(result).toBe('yellow');
  });

  it('sets a color code for an 18-year-old (age boundary), classified with adults', () => {
    let result = '';
    getMuacColorCode(18, 20.0, (color) => {
      result = color;
    });
    expect(result).toBe('yellow');
  });
});
