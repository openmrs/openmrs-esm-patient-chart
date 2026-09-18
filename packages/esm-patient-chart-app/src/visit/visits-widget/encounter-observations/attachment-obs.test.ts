import { describe, expect, it } from 'vitest';
import {
  type ComplexObs,
  getAttachmentFileName,
  getAttachmentLabel,
  getAttachmentUrl,
  isAttachmentObs,
} from './attachment-obs';

const obs = (valueComplex: string | null, extra: Partial<ComplexObs> = {}): ComplexObs =>
  ({ uuid: 'obs-uuid', valueComplex, ...extra }) as ComplexObs;

describe('isAttachmentObs', () => {
  it('is true only when the obs carries a valueComplex', () => {
    expect(isAttachmentObs(obs('m3ks | instructions.default | image/png | scan.png |complex_obs/scan.png'))).toBe(true);
    expect(isAttachmentObs(obs(null))).toBe(false);
    expect(isAttachmentObs(obs(''))).toBe(false);
    expect(isAttachmentObs({ uuid: 'x', value: 12 } as ComplexObs)).toBe(false);
  });
});

describe('getAttachmentFileName', () => {
  it('reads the file name from the attachments module layout with a storage key', () => {
    expect(
      getAttachmentFileName(
        obs(
          'm3ks | instructions.default | image/jpeg | brainScan.jpeg |complex_obs/2026/09-18/2026-09-18-x-brainScan.jpeg',
        ),
      ),
    ).toBe('brainScan.jpeg');
  });

  it('reads the file name from the older attachments layout without a key', () => {
    expect(
      getAttachmentFileName(obs('m3ks | instructions.default | application/pdf | Printed Patient Summary.pdf')),
    ).toBe('Printed Patient Summary.pdf');
  });

  it('falls back to the core layout for obs the module did not write', () => {
    expect(getAttachmentFileName(obs('discharge summary.pdf file |complex_obs/discharge.pdf'))).toBe(
      'discharge summary.pdf',
    );
    expect(getAttachmentFileName(obs('photo.png image |complex_obs/photo.png'))).toBe('photo.png');
  });

  it('strips the obs uuid older attachments appended to the stored name', () => {
    expect(getAttachmentFileName(obs('m3ks | instructions.default | image/png | scan_obs-uuid.png'))).toBe('scan.png');
  });
});

describe('getAttachmentLabel', () => {
  const stored = 'm3ks | instructions.default | image/png | scan.png |key/scan.png';

  it('prefers the caption', () => {
    expect(getAttachmentLabel(obs(stored, { comment: 'Front view' }))).toBe('Front view');
  });

  it('uses the file name when the caption is blank', () => {
    expect(getAttachmentLabel(obs(stored, { comment: '  ' }))).toBe('scan.png');
    expect(getAttachmentLabel(obs(stored))).toBe('scan.png');
  });
});

describe('getAttachmentUrl', () => {
  it('points at the attachment bytes endpoint for the obs', () => {
    expect(getAttachmentUrl(obs('m3ks | x | y | z'))).toBe('/openmrs/ws/rest/v1/attachment/obs-uuid/bytes');
  });
});
