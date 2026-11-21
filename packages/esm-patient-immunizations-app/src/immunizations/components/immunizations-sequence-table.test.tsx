import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { type ImmunizationGrouped } from '../../types';
import SequenceTable from './immunizations-sequence-table.component';

const originalTimezone = process.env.TZ;

function immunizationWithDose(expirationDate: string): ImmunizationGrouped {
  return {
    vaccineName: 'Polio vaccination, oral',
    vaccineUuid: '783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    sequences: [],
    existingDoses: [
      {
        immunizationObsUuid: 'immunization-uuid',
        doseNumber: 1,
        occurrenceDateTime: '2026-11-17T09:00:00+00:00',
        nextDoseDate: null,
        expirationDate,
        lotNumber: '12334',
        manufacturer: 'Red',
        note: [],
      },
    ],
  };
}

function renderSequenceTable(expirationDate: string) {
  render(
    <SequenceTable
      immunizationsByVaccine={immunizationWithDose(expirationDate)}
      launchPatientImmunizationForm={vi.fn()}
      patientUuid="patient-uuid"
    />,
  );
}

function expirationDateCell() {
  const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
  const [, doseRow] = screen.getAllByRole('row');
  return within(doseRow).getAllByRole('cell')[headers.indexOf('Expiration date')];
}

describe('SequenceTable', () => {
  afterEach(() => {
    process.env.TZ = originalTimezone;
  });

  it('shows the recorded expiration date in timezones behind UTC', () => {
    process.env.TZ = 'America/Los_Angeles';

    renderSequenceTable('2026-11-30');

    expect(expirationDateCell()).toHaveTextContent(/30.Nov.2026/);
  });

  it('shows the recorded expiration date in timezones ahead of UTC', () => {
    process.env.TZ = 'Asia/Kolkata';

    renderSequenceTable('2026-11-30');

    expect(expirationDateCell()).toHaveTextContent(/30.Nov.2026/);
  });

  it('shows a placeholder when the dose has no expiration date', () => {
    renderSequenceTable(null);

    expect(expirationDateCell()).toHaveTextContent('--');
  });
});
