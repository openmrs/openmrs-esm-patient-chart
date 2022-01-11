import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatDate, formatDatetime, openmrsFetch, usePagination } from '@openmrs/esm-framework';
import { mockEnrolledProgramsResponse } from '../../../../__mocks__/programs.mock';
import { swrRender, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import ProgramsDetailedSummary from './programs-detailed-summary.component';
import dayjs from 'dayjs';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockFormatDate = formatDate as jest.Mock;
const mockFormatDateTime = formatDatetime as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    formatDate: jest.fn(),
    formatDatetime: jest.fn(),
    openmrsFetch: jest.fn(),
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('ProgramsDetailedSummary ', () => {
  it('renders an empty state view when the patient is not enrolled into any programs', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderProgramsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no program enrollments to display for this patient/)).toBeInTheDocument();
    expect(screen.getByText(/Record program enrollments/)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching program enrollments', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderProgramsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./,
      ),
    ).toBeInTheDocument();
  });

  it("renders a detailed tabular summary of the patient's program enrollments", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEnrolledProgramsResponse.slice(0, 5),
    }));
    mockFormatDate.mockImplementation((dateTime) => dayjs(dateTime).format('MMM-YYYY'));
    mockFormatDateTime.mockImplementation((dateTime) => dayjs(dateTime).format('DD-MMM-YYYY HH:mm'));

    renderProgramsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /active programs/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date enrolled/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv care and treatment/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /jan-2020/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /active$/i })).toBeInTheDocument();

    // Clicking "Add" launches the programs form in a workspace
    userEvent.click(addButton);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('programs-form-workspace');
  });
});

function renderProgramsOverview() {
  swrRender(<ProgramsDetailedSummary />);
}
