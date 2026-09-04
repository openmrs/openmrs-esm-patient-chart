import { describe, expect, it } from 'vitest';
import { type Diagnosis } from '@openmrs/esm-framework';
import { dedupeDiagnoses } from './dedupe-diagnoses';

const codedDiagnosis = (uuid: string, display: string, rank: number, certainty?: string): Diagnosis =>
  ({
    uuid: `diagnosis-${uuid}-rank-${rank}-${certainty ?? 'unset'}`,
    display,
    diagnosis: { coded: { uuid, display } },
    rank,
    certainty,
  }) as Diagnosis;

const nonCodedDiagnosis = (text: string, rank: number): Diagnosis =>
  ({
    uuid: `diagnosis-${text}-rank-${rank}`,
    display: text,
    diagnosis: { nonCoded: text },
    rank,
  }) as Diagnosis;

describe('dedupeDiagnoses', () => {
  it('collapses the same coded diagnosis recorded in multiple encounters into one entry', () => {
    const diabetesFirstEncounter = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1);
    const diabetesSecondEncounter = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1);

    const result = dedupeDiagnoses([diabetesFirstEncounter, diabetesSecondEncounter]);

    expect(result).toHaveLength(1);
    expect(result[0].diagnosis.coded.uuid).toBe('diabetes-uuid');
  });

  it('keeps the primary occurrence when the same diagnosis is primary in one encounter and secondary in another', () => {
    const secondary = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2);
    const primary = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1);

    const result = dedupeDiagnoses([secondary, primary]);

    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
  });

  it('dedupes non-coded diagnoses by their text', () => {
    const result = dedupeDiagnoses([
      nonCodedDiagnosis('Persistent cough', 2),
      nonCodedDiagnosis('Persistent cough', 2),
      nonCodedDiagnosis('Fatigue', 2),
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((diagnosis) => diagnosis.diagnosis.nonCoded)).toEqual(['Persistent cough', 'Fatigue']);
  });

  it('aggregates certainty as CONFIRMED when any duplicate is confirmed, regardless of encounter order', () => {
    const presumed = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2, 'PROVISIONAL');
    const confirmed = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2, 'CONFIRMED');

    for (const input of [
      [presumed, confirmed],
      [confirmed, presumed],
    ]) {
      const result = dedupeDiagnoses(input);

      expect(result).toHaveLength(1);
      expect(result[0].certainty).toBe('CONFIRMED');
    }
  });

  it('keeps certainty PROVISIONAL when no duplicate is confirmed', () => {
    const result = dedupeDiagnoses([
      codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1, 'PROVISIONAL'),
      codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2, 'PROVISIONAL'),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].certainty).toBe('PROVISIONAL');
  });

  it('aggregates rank and certainty independently, so the result may match no single record', () => {
    const primaryPresumed = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1, 'PROVISIONAL');
    const secondaryConfirmed = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2, 'CONFIRMED');

    const result = dedupeDiagnoses([primaryPresumed, secondaryConfirmed]);

    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
    expect(result[0].certainty).toBe('CONFIRMED');
  });

  it('takes the defined certainty when a duplicate has none, in either order', () => {
    const withCertainty = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1, 'PROVISIONAL');
    const withoutCertainty = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2);

    for (const input of [
      [withCertainty, withoutCertainty],
      [withoutCertainty, withCertainty],
    ]) {
      const result = dedupeDiagnoses(input);

      expect(result).toHaveLength(1);
      expect(result[0].certainty).toBe('PROVISIONAL');
    }
  });

  it('sorts diagnoses without a rank after ranked ones', () => {
    const unranked = {
      uuid: 'diagnosis-unranked',
      display: 'Fatigue',
      diagnosis: { coded: { uuid: 'fatigue-uuid', display: 'Fatigue' } },
    } as Diagnosis;
    const secondary = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 2);

    const result = dedupeDiagnoses([unranked, secondary]);

    expect(result.map((diagnosis) => diagnosis.uuid)).toEqual([secondary.uuid, 'diagnosis-unranked']);
  });

  it('does not merge distinct diagnoses and sorts them by rank', () => {
    const hypertension = codedDiagnosis('hypertension-uuid', 'Hypertension', 2);
    const diabetes = codedDiagnosis('diabetes-uuid', 'Diabetes mellitus', 1);
    const cough = nonCodedDiagnosis('Persistent cough', 2);

    const result = dedupeDiagnoses([hypertension, diabetes, cough]);

    expect(result).toHaveLength(3);
    expect(result[0].diagnosis.coded.uuid).toBe('diabetes-uuid');
  });
});
