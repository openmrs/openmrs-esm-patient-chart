import { beforeEach, describe, expect, it } from 'vitest';
import { optInStorageKey } from './constants';
import { _resetOptInStore, isOptedIn, setOptIn, setOptInUser } from './opt-in-store';

const patientUuid = 'patient-uuid-1';
const conceptUuid = 'concept-creatinine';
const userUuid = 'user-uuid-1';

describe('opt-in store', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetOptInStore();
    setOptInUser(userUuid);
  });

  it('records and reports an opt-in for a patient and concept', () => {
    setOptIn(patientUuid, conceptUuid, true);

    expect(isOptedIn(patientUuid, conceptUuid)).toBe(true);
    // Stored as the moment it was recorded, so it cannot be applied to earlier orders.
    expect(JSON.parse(localStorage.getItem(optInStorageKey(userUuid)))).toEqual({
      [`${patientUuid}:${conceptUuid}`]: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
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
    expect(JSON.parse(localStorage.getItem(optInStorageKey(userUuid)))).toEqual({});
  });

  it('is a no-op when either uuid is missing', () => {
    setOptIn(undefined, conceptUuid, true);
    setOptIn(patientUuid, undefined, true);

    expect(localStorage.getItem(optInStorageKey(userUuid))).toBeNull();
  });

  it('does not rewrite storage when nothing changed', () => {
    setOptIn(patientUuid, conceptUuid, false);

    expect(localStorage.getItem(optInStorageKey(userUuid))).toBeNull();
  });

  describe('on a shared workstation', () => {
    const otherUserUuid = 'user-uuid-2';

    it('does not hand one clinician the opt-in another one made', () => {
      setOptIn(patientUuid, conceptUuid, true);

      setOptInUser(otherUserUuid);

      expect(isOptedIn(patientUuid, conceptUuid)).toBe(false);
    });

    it('does not let one clinician clear another one’s opt-in', () => {
      setOptIn(patientUuid, conceptUuid, true);

      setOptInUser(otherUserUuid);
      setOptIn(patientUuid, conceptUuid, false);
      setOptInUser(userUuid);

      expect(isOptedIn(patientUuid, conceptUuid)).toBe(true);
    });

    it('gives each clinician their opt-ins back when they sign in again', () => {
      setOptIn(patientUuid, conceptUuid, true);

      setOptInUser(otherUserUuid);
      setOptIn(patientUuid, 'concept-haemoglobin', true);
      setOptInUser(userUuid);

      expect(isOptedIn(patientUuid, conceptUuid)).toBe(true);
      expect(isOptedIn(patientUuid, 'concept-haemoglobin')).toBe(false);
    });
  });

  it('keeps the opt-in in memory when there is no user to key storage by', () => {
    _resetOptInStore();

    setOptIn(patientUuid, conceptUuid, true);

    expect(isOptedIn(patientUuid, conceptUuid)).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});
