import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type Obs, useConfig } from '@openmrs/esm-framework';
import EncounterObservations from './encounter-observations.component';

const mockUseConfig = vi.mocked(useConfig);

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
  mockUseConfig.mockReturnValue({ obsConceptUuidsToHide: [] } as any);
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
});
