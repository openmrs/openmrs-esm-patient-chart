import { describe, it, expect } from 'vitest';
import { extractNumbers, getMuacColorCode } from './vitals-biometrics-form.utils';

describe('getMuacColorCode', () => {
  it.each([
    // under 5 years - infants (age 0: 6-11 months)
    [0, 11.0, 'red', 'infant under-1y: red below 11.5 (SAM)'],
    [0, 11.5, 'yellow', 'infant under-1y: yellow at 11.5 boundary (MAM)'],
    [0, 12.0, 'yellow', 'infant under-1y: yellow in 11.5-12.5 range (MAM)'],
    [0, 12.5, 'green', 'infant under-1y: green at 12.5 boundary (Normal)'],
    [0, 12.8, 'green', 'infant under-1y: green at 12.8 (Normal healthy infant)'],
    [0, 14.8, 'green', 'infant under-1y: green at 14.8 (Normal healthy infant)'],
    // under 5 years - toddlers (age 1-4)
    [1, 11.0, 'red', '1-year-old: red below 11.5'],
    [1, 12.8, 'green', '1-year-old: green at 12.8'],
    [4, 11.0, 'red', 'under-5: red below 11.5'],
    [4, 11.5, 'yellow', 'under-5: yellow at 11.5 boundary'],
    [4, 12.5, 'green', 'under-5: green at 12.5 boundary'],
    // 5 to <10 years
    [5, 13.0, 'red', '5-<10y: red below 13.5 (age-boundary case)'],
    [7, 13.5, 'yellow', '5-<10y: yellow at 13.5 boundary'],
    [7, 14.5, 'green', '5-<10y: green at 14.5 boundary'],
    // 10 to <15 years
    [10, 15.0, 'red', '10-<15y: red below 16.0 (age-boundary case)'],
    [12, 16.0, 'yellow', '10-<15y: yellow at 16.0 boundary'],
    [12, 18.5, 'green', '10-<15y: green at 18.5 boundary'],
    // 15 to <18 years
    [15, 18.0, 'red', '15-<18y: red below 18.5 (age-boundary case)'],
    [16, 18.5, 'yellow', '15-<18y: yellow at 18.5 boundary'],
    [16, 21.0, 'green', '15-<18y: green at 21.0 boundary'],
    // 18 years and above (adults)
    [18, 18.0, 'red', '18+: red below 19.0 (age-boundary case)'],
    [20, 19.0, 'yellow', '18+: yellow at 19.0 boundary'],
    [20, 22.0, 'green', '18+: green at 22.0 boundary'],
  ])('age=%i, muac=%fcm -> %s (%s)', (age, muac, expectedColor) => {
    let result = '';
    getMuacColorCode(age, muac, (color) => {
      result = color;
    });
    expect(result).toBe(expectedColor);
  });

  it('does not apply malnutrition color coding for infants under 6 months', () => {
    let result = 'initial';
    // 2-month-old infant with normal 10.5 cm MUAC (Uganda IMAM Guidelines Table 2)
    getMuacColorCode(
      0,
      10.5,
      (color) => {
        result = color;
      },
      2,
    );
    expect(result).toBe('');

    // 4-month-old infant with 11.0 cm MUAC
    getMuacColorCode(
      0,
      11.0,
      (color) => {
        result = color;
      },
      4,
    );
    expect(result).toBe('');

    // 8-month-old infant with 11.0 cm MUAC (6-59m bracket applies -> SAM / red)
    getMuacColorCode(
      0,
      11.0,
      (color) => {
        result = color;
      },
      8,
    );
    expect(result).toBe('red');
  });

  it('resets color code to empty string for invalid or non-positive values', () => {
    let result = 'initial';
    getMuacColorCode(null, 12.0, (color) => {
      result = color;
    });
    expect(result).toBe('');

    result = 'initial';
    getMuacColorCode(0, 0, (color) => {
      result = color;
    });
    expect(result).toBe('');

    result = 'initial';
    getMuacColorCode(0, -1, (color) => {
      result = color;
    });
    expect(result).toBe('');

    result = 'initial';
    getMuacColorCode(-1, 12.0, (color) => {
      result = color;
    });
    expect(result).toBe('');

    result = 'initial';
    getMuacColorCode(NaN, 12.0, (color) => {
      result = color;
    });
    expect(result).toBe('');
  });
});

describe('extractNumbers', () => {
  it('extracts number from a string with digits', () => {
    expect(extractNumbers('24 yrs')).toBe(24);
    expect(extractNumbers('100')).toBe(100);
  });

  it('returns null for null, undefined, or strings without digits', () => {
    expect(extractNumbers(null)).toBeNull();
    expect(extractNumbers(undefined)).toBeNull();
    expect(extractNumbers('')).toBeNull();
    expect(extractNumbers('abc')).toBeNull();
  });
});
