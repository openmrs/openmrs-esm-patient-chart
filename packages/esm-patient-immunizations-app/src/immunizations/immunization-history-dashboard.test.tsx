import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ImmunizationConfigObject } from '../config-schema';
import { type ImmunizationGrouped } from '../types';
import { mockPatient } from 'tools';
import { useImmunizations } from '../hooks/useImmunizations';
import ImmunizationHistoryDashboard from './immunization-history-dashboard.component';

vi.mock('../hooks/useImmunizations', () => ({
  useImmunizations: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig<ImmunizationConfigObject>);
const mockUseImmunizations = vi.mocked(useImmunizations);

const mockConfig: ImmunizationConfigObject = {
  ...(getDefaultsFromConfigSchema(configSchema) as ImmunizationConfigObject),
  sequenceDefinitions: [
    {
      vaccineConceptUuid: 'polio-uuid',
      sequences: [
        {
          sequenceLabel: 'Primary Series',
          sequenceNumber: 1,
        },
        {
          sequenceLabel: 'Booster-1',
          sequenceNumber: 11,
        },
      ],
    },
  ],
};

const createDose = (immunizationObsUuid: string, doseNumber: number, occurrenceDateTime: string) => ({
  immunizationObsUuid,
  occurrenceDateTime,
  doseNumber,
  note: [],
  visitUuid: 'visit-uuid',
  expirationDate: '2025-11-20T00:00:00.000Z',
  nextDoseDate: '2019-11-20T00:00:00.000Z',
  lotNumber: 'LOT123',
  manufacturer: 'Test Manufacturer',
});

const mockImmunizations = (data: Array<ImmunizationGrouped>) =>
  mockUseImmunizations.mockReturnValue({
    data,
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  });

describe('ImmunizationHistoryDashboard', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(mockConfig);
  });

  it('labels each dose with its configured sequence label', () => {
    mockImmunizations([
      {
        vaccineUuid: 'polio-uuid',
        vaccineName: 'Polio',
        existingDoses: [
          createDose('1', 1, '2018-11-20T00:00:00.000Z'),
          createDose('2', 11, '2019-11-20T00:00:00.000Z'),
        ],
      },
    ]);

    render(<ImmunizationHistoryDashboard patientUuid={mockPatient.id} />);

    const historyTable = screen.getByRole('table', { name: /immunization history/i });
    const polioRow = within(historyTable).getByRole('row', { name: /polio/i });
    expect(within(polioRow).getByText('Primary Series')).toBeInTheDocument();
    expect(within(polioRow).getByText('Booster-1')).toBeInTheDocument();
    expect(within(polioRow).queryByText(/dose 11/i)).not.toBeInTheDocument();
  });

  it('falls back to the dose number when no sequence is configured for the dose', () => {
    mockImmunizations([
      {
        vaccineUuid: 'polio-uuid',
        vaccineName: 'Polio',
        existingDoses: [createDose('1', 2, '2018-11-20T00:00:00.000Z')],
      },
      {
        vaccineUuid: 'hepatitis-b-uuid',
        vaccineName: 'Hepatitis B',
        existingDoses: [createDose('2', 1, '2020-05-15T00:00:00.000Z')],
      },
    ]);

    render(<ImmunizationHistoryDashboard patientUuid={mockPatient.id} />);

    const historyTable = screen.getByRole('table', { name: /immunization history/i });
    expect(within(within(historyTable).getByRole('row', { name: /polio/i })).getByText('Dose 2')).toBeInTheDocument();
    expect(
      within(within(historyTable).getByRole('row', { name: /hepatitis b/i })).getByText('Dose 1'),
    ).toBeInTheDocument();
  });
});
