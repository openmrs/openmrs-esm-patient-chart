import { validateClinicalNotes, sanitizeClinicalNotes } from './notes-validation';

describe('manual validation run for clinical notes', () => {
  test('sample inputs show expected validation and sanitization', () => {
    const samples = [
      {
        name: 'valid text',
        text: 'Patient reports dizziness and nausea.',
      },
      {
        name: 'emoji present (warning)',
        text: 'Alert ⚠️ patient about medication',
      },
      {
        name: 'zero-width present',
        text: 'Zero\u200Bwidth test',
      },
      {
        name: 'control char present (BEL)',
        text: 'Control\u0007char test',
      },
    ];

    samples.forEach((s) => {
      const validation = validateClinicalNotes(s.text);
      const sanitized = sanitizeClinicalNotes(s.text);
      // Log results so a quick run demonstrates behavior
      // eslint-disable-next-line no-console
      console.log(`\n[${s.name}] input:`, s.text);
      // eslint-disable-next-line no-console
      console.log('validation:', validation);
      // eslint-disable-next-line no-console
      console.log('sanitized:', sanitized);
    });

    // Basic assertions to ensure validation flags the problematic samples
    expect(validateClinicalNotes(samples[0].text).isValid).toBe(true);
    expect(validateClinicalNotes(samples[1].text).isValid).toBe(false);
    expect(validateClinicalNotes(samples[2].text).isValid).toBe(false);
    expect(validateClinicalNotes(samples[3].text).isValid).toBe(false);
  });
});
