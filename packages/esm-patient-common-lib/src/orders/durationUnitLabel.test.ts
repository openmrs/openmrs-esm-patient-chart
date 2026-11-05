import { beforeAll, describe, expect, it } from 'vitest';
import i18next from 'i18next';
import { getDurationUnitLabel } from './durationUnitLabel';

const weeks = { uuid: '5f20a893-6e84-4713-a9f6-5a189e99e98f', display: 'Semaines' };
const days = { uuid: '7923cbfd-79c9-4155-8897-cbf629f4c1bc', display: 'Jours' };

describe('getDurationUnitLabel', () => {
  beforeAll(async () => {
    await i18next.init({
      lng: 'fr',
      resources: {
        fr: {
          translation: {
            [`durationUnit_${weeks.uuid}_one`]: 'semaine',
            [`durationUnit_${weeks.uuid}_other`]: 'semaines',
          },
        },
      },
    });
  });

  it('uses the singular translation for a duration of 1', () => {
    expect(getDurationUnitLabel(i18next.t, weeks, 1)).toBe('semaine');
  });

  it('uses the plural translation for a duration of 2', () => {
    expect(getDurationUnitLabel(i18next.t, weeks, 2)).toBe('semaines');
  });

  it('falls back to the lower-cased concept name when no translation is configured', () => {
    expect(getDurationUnitLabel(i18next.t, days, 1)).toBe('jours');
  });

  it('falls back to the concept name when the unit has no uuid', () => {
    expect(getDurationUnitLabel(i18next.t, { display: 'Days' }, 3)).toBe('days');
    expect(getDurationUnitLabel(i18next.t, null, 3)).toBe('');
  });
});
