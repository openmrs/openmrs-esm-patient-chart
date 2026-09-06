import { describe, it, expect } from 'vitest';
import { getMuacColorCode } from './vitals-biometrics-form.utils';

describe('getMuacColorCode', () => {
  it('sets a color code for a healthy 5-year-old (age boundary)', () => {
    let result = '';
    getMuacColorCode(5, 13, (color) => {
      result = color;
    });
    expect(result).toBe('green');
  });

  it('sets a color code for a 10-year-old (age boundary)', () => {
    let result = '';
    getMuacColorCode(10, 20, (color) => {
      result = color;
    });
    expect(result).toBe('green');
  });

  it('sets a color code for an 18-year-old (age boundary)', () => {
    let result = '';
    getMuacColorCode(18, 20, (color) => {
      result = color;
    });
    expect(result).toBe('green');
  });
});
