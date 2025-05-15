import React from 'react';
import { getConfig, showModal, userHasAccess } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockEncountersAlice, mockEncounterTypes, mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, useEncounterTypes } from './encounters-table.resource';

const testProps: EncountersTableProps = {
  patientUuid: mockPatientAlice.uuid,
  paginatedEncounters: mockEncountersAlice,
  totalCount: mockEncountersAlice.length,
  currentPage: 1,
  goTo: jest.fn(),
  isLoading: false,
  onEncountersUpdated: jest.fn(),
  showVisitType: true,
  showEncounterTypeFilter: false,
  pageSize: 10,
  setPageSize: jest.fn(),
};

const mockShowModal = jest.mocked(showModal);
const mockGetConfig = jest.mocked(getConfig);
const mockUserHasAccess = jest.mocked(userHasAccess);

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

jest.mock('./encounters-table.resource', () => ({
  ...jest.requireActual('./encounters-table.resource'),
  useEncounterTypes: () => mockUseEncounterTypes(),
}));

describe('EncountersTable', () => {
  it('renders an empty state when no encounters are available', async () => {
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
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

describe('Delete Encounter', () => {
  it('Clicking the `Delete` button deletes an encounter', async () => {
    const user = userEvent.setup();

    mockUserHasAccess.mockReturnValue(true);

    renderEncountersTable();

    await screen.findByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const row = screen.getByRole('row', {
      name: /18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Options/i,
    });

    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    await user.click(screen.getByRole('button', { name: /danger Delete this encounter/i }));

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
