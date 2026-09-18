import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, type Obs, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig, esmPatientChartSchema } from '../../../config-schema';
import EncounterObservations from './encounter-observations.component';

const mockUseConfig = vi.mocked(useConfig<ChartConfig>);

const makeObservation = (overrides: Partial<Obs> = {}): Obs =>
  ({
    uuid: 'obs-uuid',
    display: 'Admission location: 123',
    concept: {
      uuid: 'location-concept-uuid',
      display: 'Admission location',
    },
    value: {
      uuid: 'location-uuid',
      display: 'Inpatient Ward',
    },
    ...overrides,
  }) as Obs;

beforeEach(() => {
  mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
});

describe('EncounterObservations', () => {
  it('uses the display value for reference observations such as locations', () => {
    render(<EncounterObservations observations={[makeObservation()]} />);

    expect(screen.getByText('Admission location')).toBeInTheDocument();
    expect(screen.getByText('Inpatient Ward')).toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  it('keeps parsing the observation display for primitive values', () => {
    render(<EncounterObservations observations={[makeObservation({ display: 'Temperature: 37.2', value: 37.2 })]} />);

    expect(screen.getByText('37.2')).toBeInTheDocument();
  });

  it('keeps using the observation display for file values without a reference uuid', () => {
    const fileValue = { display: 'raw file' } as unknown as Obs['value'];

    render(
      <EncounterObservations
        observations={[makeObservation({ display: 'Attachment: discharge-summary.pdf', value: fileValue })]}
      />,
    );

    expect(screen.getByText('discharge-summary.pdf')).toBeInTheDocument();
    expect(screen.queryByText('raw file')).not.toBeInTheDocument();
  });

  it('uses the display value for reference-valued group members', () => {
    const member = makeObservation();
    const group = makeObservation({
      display: 'Admission details',
      concept: { uuid: 'group-concept-uuid', display: 'Admission details' },
      value: null,
      groupMembers: [member],
    });

    render(<EncounterObservations observations={[group]} />);

    expect(screen.getByText('Admission details')).toBeInTheDocument();
    expect(screen.getByText('Inpatient Ward')).toBeInTheDocument();
  });

  it('shows an attachment as a link to the file, labelled with its caption', () => {
    const attachment = makeObservation({
      uuid: 'att-obs',
      display: 'ATT IMAGE ATTACHMENT: m3ks',
      concept: { uuid: 'att-image-concept', display: 'ATT IMAGE ATTACHMENT' },
      value: { display: 'raw file' } as unknown as Obs['value'],
      comment: 'Brain scan',
      valueComplex: 'm3ks | instructions.default | image/jpeg | brainScan.jpeg |complex_obs/2026/brainScan.jpeg',
    } as Partial<Obs>);

    render(<EncounterObservations observations={[attachment]} />);

    const link = screen.getByRole('link', { name: 'Brain scan' });
    expect(link).toHaveAttribute('href', '/openmrs/ws/rest/v1/attachment/att-obs/bytes');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.queryByText('m3ks')).not.toBeInTheDocument();
  });

  it('falls back to the file name when an attachment has no caption', () => {
    const attachment = makeObservation({
      uuid: 'att-obs',
      display: 'ATT IMAGE ATTACHMENT: m3ks',
      value: { display: 'raw file' } as unknown as Obs['value'],
      comment: '',
      valueComplex: 'm3ks | instructions.default | image/png | box2.png |complex_obs/2026/box2.png',
    } as Partial<Obs>);

    render(<EncounterObservations observations={[attachment]} />);

    expect(screen.getByRole('link', { name: 'box2.png' })).toBeInTheDocument();
  });
});
