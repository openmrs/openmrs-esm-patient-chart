/* eslint-disable testing-library/no-node-access */
/* Please re-enable this ESLint rule if you are able to find a practical way to test the overflow menu buttons
   without using parentElement and the expanded row functionality without using nextElementSibling. */

import React from 'react';
import { getConfig, getDefaultsFromConfigSchema, showModal, useConfig, userHasAccess } from '@openmrs/esm-framework';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockEncountersAlice, mockEncounterTypes, mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, useEncounterTypes } from './encounters-table.resource';
import { type ChartConfig, esmPatientChartSchema } from '../../../../config-schema';

const testProps: EncountersTableProps = {
  patientUuid: mockPatientAlice.uuid,
  paginatedEncounters: mockEncountersAlice,
  totalCount: mockEncountersAlice.length,
  currentPage: 1,
  goTo: jest.fn(),
  isLoading: false,
  showVisitType: true,
  showEncounterTypeFilter: false,
  pageSize: 10,
  setPageSize: jest.fn(),
};

const mockShowModal = jest.mocked(showModal);
const mockUserHasAccess = jest.mocked(userHasAccess).mockReturnValue(true);

const mockUseEncounterTypes = jest.fn(useEncounterTypes).mockReturnValue({
  data: mockEncounterTypes,
  totalCount: mockEncounterTypes.length,
  hasMore: false,
  loadMore: jest.fn(),
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  nextUri: '',
});

const mockUseConfig = jest.mocked(useConfig);

jest.mock('./encounters-table.resource', () => ({
  ...jest.requireActual('./encounters-table.resource'),
  useEncounterTypes: () => mockUseEncounterTypes(),
}));

describe('EncountersTable', () => {
  it('renders an empty state when no encounters are available', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    renderEncountersTable({ totalCount: 0, paginatedEncounters: [] });

    expect(screen.getByText(/No encounters to display/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", async () => {
    renderEncountersTable();

    await screen.findByRole('table');

    const expectedColumnHeaders = [/date & time/, /visit type/, /encounter type/, /form name/, /provider/];
    const expectedTableRows = [
      /18\-jan\-2022, 04:25 pm facility visit admission poc consent form \-\- options/,
      /03\-aug\-2021, 12:47 am facility visit visit note \-\- user one options/,
      /05\-jul\-2021, 10:07 am facility visit consultation covid 19 dennis the doctor options/,
    ];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
  });
});

describe('Encounter editability', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2022-01-18T20:00:00.000Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays edit and delete encounter buttons by default', async () => {
    mockUserHasAccess.mockImplementation((privilege) => privilege == null);
    const user = userEvent.setup();

    renderEncountersTable();

    const row = screen.getByRole('row', {
      name: /18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Options/i,
    });

    // Check overflow menu buttons
    await user.click(within(row).getByRole('button', { name: /options/i }));
    const overflowMenu = screen.getAllByText('Focus sentinel')[0].parentElement;
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: /options/i }));
    expect(screen.queryByText('Focus sentinel')).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    const expandedRow = row.nextElementSibling as HTMLElement;
    expect(within(expandedRow).getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(within(expandedRow).getByRole('button', { name: /danger Delete this encounter/i })).toBeInTheDocument();
  });

  it('displays edit and delete encounter buttons only if the encounter is within the editable duration', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return {
        ...(getDefaultsFromConfigSchema(esmPatientChartSchema) as ChartConfig),
        encounterEditableDuration: 1440,
        encounterEditableDurationOverridePrivileges: ['Super Edit Encounter', 'Magic Superpowers'],
      };
    });
    mockUserHasAccess.mockImplementation((privilege) => privilege == null);

    const user = userEvent.setup();

    renderEncountersTable();

    // Check today's encounter -- should be editable
    const todayRow = screen.getByRole('row', {
      name: /18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Options/i,
    });

    // Check overflow menu buttons
    await user.click(within(todayRow).getByRole('button', { name: /options/i }));
    const overflowMenu = screen.getAllByText('Focus sentinel')[0].parentElement;
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(todayRow).getByRole('button', { name: /options/i }));
    expect(screen.queryByText('Focus sentinel')).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(todayRow).getByRole('button', { name: /expand current row/i }));
    const expandedTodayRow = todayRow.nextElementSibling as HTMLElement;
    await user.click(within(expandedTodayRow).getByRole('button', { name: /edit this encounter/i }));
    expect(within(expandedTodayRow).getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(within(expandedTodayRow).getByRole('button', { name: /danger Delete this encounter/i })).toBeInTheDocument();

    // Check old encounter -- should not be editable
    const oldRow = screen.getByRole('row', {
      name: /03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One/i,
    });
    expect(within(oldRow).queryByRole('button', { name: /options/i })).not.toBeInTheDocument();
    await user.click(within(oldRow).getByRole('button', { name: /expand current row/i }));
    const expandedOldRow = oldRow.nextElementSibling as HTMLElement;
    expect(within(expandedOldRow).queryByRole('button', { name: /edit this encounter/i })).not.toBeInTheDocument();
    expect(
      within(expandedOldRow).queryByRole('button', { name: /danger Delete this encounter/i }),
    ).not.toBeInTheDocument();
  });

  it('displays edit and delete buttons if the user has the override privilege, even if the encounter is outside the editable duration', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return {
        ...(getDefaultsFromConfigSchema(esmPatientChartSchema) as ChartConfig),
        encounterEditableDuration: 1440,
        encounterEditableDurationOverridePrivileges: ['Super Edit Encounter', 'Magic Superpowers'],
      };
    });

    mockUserHasAccess.mockImplementation((privilege) => privilege == null || privilege === 'Magic Superpowers');

    const user = userEvent.setup();

    renderEncountersTable();

    const oldRow = screen.getByRole('row', {
      name: /03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One Options/i,
    });

    // Check overflow menu buttons
    await user.click(within(oldRow).getByRole('button', { name: /options/i }));
    const overflowMenu = screen.getAllByText('Focus sentinel')[0].parentElement;
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(oldRow).getByRole('button', { name: /options/i }));
    expect(screen.queryByText('Focus sentinel')).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(oldRow).getByRole('button', { name: /expand current row/i }));
    const expandedOldRow = oldRow.nextElementSibling as HTMLElement;
    expect(within(expandedOldRow).getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(within(expandedOldRow).getByRole('button', { name: /danger Delete this encounter/i })).toBeInTheDocument();
  });
});

describe('Delete Encounter', () => {
  beforeEach(() => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    mockUserHasAccess.mockReturnValue(true);
  });

  it('Clicking the `Delete` button deletes an encounter', async () => {
    const user = userEvent.setup();

    renderEncountersTable();

    await screen.findByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const row = screen.getByRole('row', {
      name: /18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Options/i,
    });

    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    const expandedRow = row.nextElementSibling as HTMLElement;
    await user.click(within(expandedRow).getByRole('button', { name: /danger Delete this encounter/i }));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith(
      'delete-encounter-modal',
      expect.objectContaining({
        encounterTypeName: 'POC Consent Form',
      }),
    );
  });
});

function renderEncountersTable(props: Partial<EncountersTableProps> = {}) {
  renderWithSwr(<EncountersTable {...testProps} {...props} />);
}
