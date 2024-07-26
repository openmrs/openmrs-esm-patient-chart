import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { getConfig, showModal, userHasAccess } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr } from 'tools';
import { mockEncounters } from '__mocks__';
import VisitsTable from './visits-table.component';

const defaultProps = {
  patientUuid: mockPatient.id,
  showAllEncounters: true,
  visits: mockEncounters,
};

const mockShowModal = jest.mocked(showModal);
const mockGetConfig = getConfig as jest.Mock;
const mockUserHasAccess = userHasAccess as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  getConfig: jest.fn().mockResolvedValue({ htmlFormEntryForms: [] }),
  userHasAccess: jest.fn().mockImplementation((privilege, _) => (privilege ? false : true)),
}));

describe('EncounterList', () => {
  it('renders an empty state when no encounters are available', async () => {
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    renderVisitsTable({ visits: [] });

    await screen.findByTitle(/empty data illustration/i);
    expect(screen.getByText(/there are no encounters to display for this patient/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", async () => {
    const user = userEvent.setup();

    renderVisitsTable({ visits: mockEncounters });

    await screen.findByRole('table');

    const filterDropdown = screen.getByRole('combobox', { name: /filter by encounter type/i });
    const searchbox = screen.getByRole('searchbox', { name: /filter table/i });
    const expectedColumnHeaders = [/date & time/, /visit type/, /Form name/, /encounter type/, /provider/];
    const expectedTableRows = [
      /18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Options/,
      /03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One Options/,
      /05-Jul-2021, 10:07 AM Facility Visit Consultation Covid 19 Dennis The Doctor Options/,
    ];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    // filter table to show only `Admission` encounters
    await user.click(filterDropdown);
    await user.click(screen.getByRole('option', { name: /Admission/i }));

    // screen.logTestingPlaygroundURL();
    expect(screen.queryByRole('cell', { name: /visit note/i })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /admission/i })).toBeInTheDocument();

    // show all encounter types
    await user.click(filterDropdown);
    await user.click(screen.getByRole('option', { name: /all/i }));

    // filter table by typing in the searchbox
    await user.type(searchbox, 'Visit Note');

    expect(screen.queryByText(/consultation/i)).not.toBeInTheDocument();
    expect(screen.getByText(/visit note/i)).toBeInTheDocument();

    await user.clear(searchbox);
    await user.type(searchbox, 'triage');

    expect(screen.getByText(/no encounters to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });
});

describe('Delete Encounter', () => {
  it('Clicking the `Delete` button deletes an encounter', async () => {
    const user = userEvent.setup();

    mockUserHasAccess.mockReturnValue(true);

    renderVisitsTable({ visits: mockEncounters });

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

function renderVisitsTable(props = {}) {
  renderWithSwr(<VisitsTable {...defaultProps} {...props} />);
}
