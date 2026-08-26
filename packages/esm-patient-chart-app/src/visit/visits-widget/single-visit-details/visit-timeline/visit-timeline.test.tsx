import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type Encounter,
  ExtensionSlot,
  getDefaultsFromConfigSchema,
  launchWorkspace2,
  useConfig,
  useFeatureFlag,
  userHasAccess,
  type Visit,
} from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { mockEncountersAlice, mockFhirPatient, mockPatientAlice, mockVisit } from '__mocks__';
import { renderWithSwr } from 'tools';
import { type ChartConfig, defaultVisitTimelinePageSize, esmPatientChartSchema } from '../../../../config-schema';
import { jsonSchemaResourceName } from '../../../../constants';
import { type MappedEncounter } from '../../past-visits-components/encounters-table/encounters-table.resource';
import VisitTimeline from './visit-timeline.component';

const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockLaunchWorkspace = vi.mocked(launchWorkspace2);
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  usePatientChartStore: vi.fn(),
}));

// The Admission encounter was recorded through a form but has no observations, while the Visit Note
// encounter has observations but no form. Between them they cover both expanded-panel states.
const [admissionEncounter, visitNoteEncounter, consultationEncounter] = mockEncountersAlice;

// Printing and the embedded form view are only offered for forms carrying a JSON schema resource
const encounterWithJsonSchemaForm = {
  ...admissionEncounter,
  form: {
    ...admissionEncounter.form,
    resources: [
      {
        uuid: 'embedded-form-resource',
        name: jsonSchemaResourceName,
        dataType: 'AmpathJsonSchema',
        valueReference: 'embedded-schema-reference',
      },
    ],
  },
} as Encounter;

// Each encounter is a day older than the one before it, so the timeline renders them in index order
function buildEncounters(count: number): Array<Encounter> {
  return Array.from(
    { length: count },
    (_, index) =>
      ({
        ...admissionEncounter,
        uuid: `encounter-${index}`,
        encounterDatetime: new Date(Date.UTC(2024, 0, 1) - index * 24 * 60 * 60 * 1000).toISOString(),
        encounterType: { ...admissionEncounter.encounterType, display: `Encounter ${index}` },
      }) as Encounter,
  );
}

function renderVisitTimeline(
  encounters: Array<Encounter> = mockEncountersAlice,
  onEditEncounter?: (encounter: MappedEncounter, isVisitNote: boolean) => void,
) {
  const visit = { ...mockVisit, encounters } as Visit;
  return renderWithSwr(
    <VisitTimeline visit={visit} patientUuid={mockPatientAlice.uuid} onEditEncounter={onEditEncounter} />,
  );
}

async function clickEditEncounter() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /options/i }));

  const actionsMenu = screen.getByRole('menu', { hidden: true });
  const editItem = within(actionsMenu)
    .getAllByRole('menuitem', { hidden: true })
    .find((menuItem) => /edit this encounter/i.test(menuItem.textContent));
  await user.click(editItem);
}

beforeEach(() => {
  mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
  mockUseFeatureFlag.mockReturnValue(false);
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

  it('calls onEditEncounter instead of launching a workspace when the prop is provided', async () => {
    const onEditEncounter = vi.fn();

    renderVisitTimeline([admissionEncounter], onEditEncounter);
    await clickEditEncounter();

    expect(onEditEncounter).toHaveBeenCalledTimes(1);
    expect(onEditEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ id: admissionEncounter.uuid, encounterType: 'Admission' }),
      false,
    );
    expect(mockLaunchWorkspace).not.toHaveBeenCalled();
  });

  it('launches the form entry workspace when no onEditEncounter prop is provided', async () => {
    renderVisitTimeline([admissionEncounter]);
    await clickEditEncounter();

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      form: admissionEncounter.form,
      encounterUuid: admissionEncounter.uuid,
    });
  });

  it('hides the actions menu when the user lacks the privilege to edit the encounter', () => {
    const privilegedEncounter = {
      ...admissionEncounter,
      encounterType: { ...admissionEncounter.encounterType, editPrivilege: { display: 'Edit Encounters' } },
    } as Encounter;
    // Only the encounter's edit privilege is withheld, so the menu can't be hidden for any other reason
    mockUserHasAccess.mockImplementation((privilege) => privilege !== 'Edit Encounters');

    renderVisitTimeline([privilegedEncounter]);

    expect(screen.queryByRole('button', { name: /options/i })).not.toBeInTheDocument();
  });

  it('offers a print action for an encounter recorded through a JSON schema form', async () => {
    const user = userEvent.setup();
    renderVisitTimeline([encounterWithJsonSchemaForm]);

    await user.click(screen.getByRole('button', { name: /options/i }));

    const actionsMenu = screen.getByRole('menu', { hidden: true });
    const menuItems = within(actionsMenu).getAllByRole('menuitem', { hidden: true });

    expect(menuItems.map((menuItem) => menuItem.textContent)).toEqual([
      'Edit this encounter',
      'Print this encounter',
      'Delete this encounter',
    ]);
  });

  it('renders a JSON schema form in the embedded form view, with the visit context, when the feature flag is on', async () => {
    const user = userEvent.setup();
    mockUseFeatureFlag.mockReturnValue(true);

    renderVisitTimeline([encounterWithJsonSchemaForm]);

    await user.click(screen.getByRole('button', { name: /expand encounter/i }));

    const formWidgetCall = mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot');

    expect(formWidgetCall?.[0]?.state).toEqual(
      expect.objectContaining({
        additionalProps: { mode: 'embedded-view' },
        encounterUuid: encounterWithJsonSchemaForm.uuid,
        formUuid: encounterWithJsonSchemaForm.form.uuid,
        patient: mockFhirPatient,
        patientUuid: mockPatientAlice.uuid,
        visitStartDatetime: mockVisit.startDatetime,
        visitStopDatetime: mockVisit.stopDatetime,
        visitTypeUuid: mockVisit.visitType.uuid,
        visitUuid: mockVisit.uuid,
      }),
    );
    // The observations panel is what the embedded form view replaces
    expect(screen.queryByText(/recorded via poc consent form/i)).not.toBeInTheDocument();
  });

  it('renders every encounter of a visit that fits on a single page, with the pager disabled', () => {
    renderVisitTimeline(buildEncounters(10));

    expect(screen.getAllByRole('button', { name: /expand encounter/i })).toHaveLength(10);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('paginates a long visit, ten encounters to a page', async () => {
    const user = userEvent.setup();
    renderVisitTimeline(buildEncounters(25));

    expect(screen.getAllByRole('button', { name: /expand encounter/i })).toHaveLength(10);
    expect(screen.getByText('Encounter 0')).toBeInTheDocument();
    expect(screen.queryByText('Encounter 10')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next page/i }));

    expect(screen.queryByText('Encounter 0')).not.toBeInTheDocument();
    expect(screen.getByText('Encounter 10')).toBeInTheDocument();
    expect(screen.getByText('Encounter 19')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next page/i }));

    // The last page holds the remaining five encounters
    expect(screen.getAllByRole('button', { name: /expand encounter/i })).toHaveLength(5);
    expect(screen.getByText('Encounter 24')).toBeInTheDocument();
  });

  it('takes the number of encounters shown per page from the visitTimelinePageSize config', () => {
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(esmPatientChartSchema), visitTimelinePageSize: 5 });

    renderVisitTimeline(buildEncounters(25));

    expect(screen.getAllByRole('button', { name: /expand encounter/i })).toHaveLength(5);
    expect(screen.getByText(/5 \/ 25 items/i)).toBeInTheDocument();
  });

  // The config validator only logs, so these values still reach the component
  it.each([
    [0, 1],
    [-5, 1],
    [2.5, 2],
    ['not-a-number', defaultVisitTimelinePageSize],
  ])('renders a page of encounters when visitTimelinePageSize is %s', (visitTimelinePageSize, expectedPageSize) => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      visitTimelinePageSize: visitTimelinePageSize as number,
    });

    renderVisitTimeline(buildEncounters(25));

    expect(screen.getAllByRole('button', { name: /expand encounter/i })).toHaveLength(expectedPageSize);
    expect(screen.getByText(new RegExp(`${expectedPageSize} / 25 items`, 'i'))).toBeInTheDocument();
  });
});
