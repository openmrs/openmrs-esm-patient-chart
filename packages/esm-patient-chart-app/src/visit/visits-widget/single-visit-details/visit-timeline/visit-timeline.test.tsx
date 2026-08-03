import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, userHasAccess, type Visit } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { mockEncountersAlice, mockFhirPatient, mockPatientAlice, mockVisit } from '__mocks__';
import { renderWithSwr } from 'tools';
import { esmPatientChartSchema } from '../../../../config-schema';
import VisitTimeline from './visit-timeline.component';

const mockUseConfig = vi.mocked(useConfig);
const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  usePatientChartStore: vi.fn(),
}));

// The Admission encounter was recorded through a form but has no observations, while the Visit Note
// encounter has observations but no form. Between them they cover both expanded-panel states.
const [admissionEncounter, visitNoteEncounter, consultationEncounter] = mockEncountersAlice;

function renderVisitTimeline(encounters = mockEncountersAlice) {
  const visit = { ...mockVisit, encounters } as Visit;
  return renderWithSwr(<VisitTimeline visit={visit} patientUuid={mockPatientAlice.uuid} />);
}

beforeEach(() => {
  mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
  mockUserHasAccess.mockReturnValue(true);
  mockUsePatientChartStore.mockReturnValue({
    patientUuid: mockPatientAlice.uuid,
    patient: mockFhirPatient,
    visitContext: null,
    mutateVisitContext: vi.fn(),
    setPatient: vi.fn(),
    setVisitContext: vi.fn(),
  } as any);
});

describe('VisitTimeline', () => {
  it('renders an empty state when the visit has no encounters', () => {
    renderVisitTimeline([]);

    expect(screen.getByText(/there are no encounters for this visit to display/i)).toBeInTheDocument();
  });

  it('renders each encounter with its provider, newest first', () => {
    // Deliberately out of order so the assertion proves the component sorts
    renderVisitTimeline([visitNoteEncounter, consultationEncounter, admissionEncounter]);

    const encounterTypes = screen
      .getAllByText(/^(Admission|Visit Note|Consultation)$/)
      .map((encounterType) => encounterType.textContent);

    expect(encounterTypes).toEqual(['Admission', 'Visit Note', 'Consultation']);

    // The Admission encounter has no providers recorded
    expect(screen.getByText(/no provider/i)).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('Dennis The Doctor')).toBeInTheDocument();
  });

  it("reveals an encounter's observations when it is expanded, and hides them again when collapsed", async () => {
    const user = userEvent.setup();
    renderVisitTimeline([visitNoteEncounter]);

    expect(screen.queryByText('Immunization history')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /expand encounter/i }));

    expect(screen.getAllByText('Immunization history')).toHaveLength(2);
    expect(screen.getByText('asd, 333, 2021-08-05, 2021-08-02, 1.0,')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /collapse encounter/i }));

    expect(screen.queryByText('Immunization history')).not.toBeInTheDocument();
  });

  it('names the form an encounter was recorded via, and reports when it has no observations', async () => {
    const user = userEvent.setup();
    renderVisitTimeline([admissionEncounter]);

    await user.click(screen.getByRole('button', { name: /expand encounter/i }));

    expect(screen.getByText(/recorded via poc consent form/i)).toBeInTheDocument();
    expect(screen.getByText(/no observations found/i)).toBeInTheDocument();
  });

  it('allows multiple encounters to be expanded at the same time', async () => {
    const user = userEvent.setup();
    renderVisitTimeline([admissionEncounter, visitNoteEncounter]);

    const [firstExpandButton, secondExpandButton] = screen.getAllByRole('button', { name: /expand encounter/i });
    await user.click(firstExpandButton);
    await user.click(secondExpandButton);

    expect(screen.getAllByRole('button', { name: /collapse encounter/i })).toHaveLength(2);
    expect(screen.getByText(/recorded via poc consent form/i)).toBeInTheDocument();
    expect(screen.getAllByText('Immunization history')).toHaveLength(2);
  });

  it('offers edit and delete actions for an encounter', async () => {
    const user = userEvent.setup();
    renderVisitTimeline([admissionEncounter]);

    await user.click(screen.getByRole('button', { name: /options/i }));

    const actionsMenu = screen.getByRole('menu', { hidden: true });
    const menuItems = within(actionsMenu).getAllByRole('menuitem', { hidden: true });

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent(/edit this encounter/i);
    expect(menuItems[1]).toHaveTextContent(/delete this encounter/i);
  });

  it('hides the actions menu when the user lacks the privilege to edit the encounter', () => {
    mockUserHasAccess.mockReturnValue(false);
    renderVisitTimeline([admissionEncounter]);

    expect(screen.queryByRole('button', { name: /options/i })).not.toBeInTheDocument();
  });
});
