import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, setCurrentVisit } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import PastVisitOverview from './past-visit-overview.component';

const defaultProps = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  patientUuid: mockPatient.id,
  patient: mockPatient,
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn,
};

const mockPastVisits = {
  data: {
    results: [
      {
        uuid: '1f0b35e2-ab94-4f96-a439-ba67e4fe22b0',
        encounters: [],
        patient: { uuid: mockPatient.id },
        visitType: { uuid: 'e89b4b06-8d7a-40e6-b5ad-d3209f47040b', name: 'ECH', display: 'ECH' },
        attributes: [],
        location: { uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453', name: 'Laboratory', display: 'Laboratory' },
        startDatetime: '2021-09-07T14:44:00.000+0000',
        stopDatetime: '2021-09-07T16:26:28.000+0000',
      },
      {
        uuid: '2fcf6cbc-99e0-4b6a-9ecc-a66b455bff15',
        encounters: [],
        patient: { uuid: mockPatient.id },
        visitType: { uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed', name: 'Facility Visit', display: 'Facility Visit' },
        attributes: [],
        location: {
          uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
          name: 'Registration Desk',
          display: 'Registration Desk',
        },
        startDatetime: '2021-09-03T06:38:21.000+0000',
        stopDatetime: '2021-09-03T06:38:27.000+0000',
      },
    ],
  },
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockSetCurrentVisit = setCurrentVisit as jest.Mock;

describe('PastVisitOverview', () => {
  it(`renders a tabular overview view of the patient's past visits data`, async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(mockPastVisits);

    renderWithSwr(<PastVisitOverview {...defaultProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Past Visits/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();

    const tableHeaders = [/Start Date/i, /Type/i, /Location/i, /End Date/i];
    tableHeaders.forEach((header) => expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument());

    const tableRows = [/Sep 7, 2021 ECH Laboratory/i, /Sep 3, 2021 Facility Visit Registration Desk/i];
    tableRows.forEach((header) => expect(screen.getByRole('row', { name: header })).toBeInTheDocument());

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    await user.click(cancelButton);

    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it(`will enter retrospective entry mode for a specific visit`, async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockReturnValueOnce(mockPastVisits);
    renderWithSwr(<PastVisitOverview {...defaultProps} />);
    await waitForLoadingToFinish();
    const editButtons = screen.queryAllByLabelText('Edit this visit');
    expect(editButtons.length).toBe(2);
    await user.click(editButtons[1]);

    expect(mockSetCurrentVisit).toHaveBeenCalledWith(mockPatient.id, mockPastVisits.data.results[1].uuid);
    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });
});
