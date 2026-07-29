import { beforeEach, describe, expect, it } from 'vitest';
import { optInStorageKey } from './constants';
import { _resetOptInStore, isOptedIn, setOptIn } from './opt-in-store';

const patientUuid = 'patient-uuid-1';
const conceptUuid = 'concept-creatinine';

describe('opt-in store', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetOptInStore();
  });

  it('records and reports an opt-in for a patient and concept', () => {
    setOptIn(patientUuid, conceptUuid, true);

    expect(isOptedIn(patientUuid, conceptUuid)).toBe(true);
    expect(JSON.parse(localStorage.getItem(optInStorageKey))).toEqual({ [`${patientUuid}:${conceptUuid}`]: true });
  });

  it('scopes the opt-in to that patient and that concept', () => {
    setOptIn(patientUuid, conceptUuid, true);

    expect(isOptedIn('patient-uuid-2', conceptUuid)).toBe(false);
    expect(isOptedIn(patientUuid, 'concept-haemoglobin')).toBe(false);
  });

  it('clears an opt-in when the toggle is turned back off', () => {
    setOptIn(patientUuid, conceptUuid, true);
    setOptIn(patientUuid, conceptUuid, false);

    expect(isOptedIn(patientUuid, conceptUuid)).toBe(false);
    expect(JSON.parse(localStorage.getItem(optInStorageKey))).toEqual({});
  });

  it('is a no-op when either uuid is missing', () => {
    setOptIn(undefined, conceptUuid, true);
    setOptIn(patientUuid, undefined, true);

    expect(localStorage.getItem(optInStorageKey)).toBeNull();
  });

  it('does not rewrite storage when nothing changed', () => {
    setOptIn(patientUuid, conceptUuid, false);

    expect(localStorage.getItem(optInStorageKey)).toBeNull();
  });
});
