import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { launchWorkspace } from '@openmrs/esm-framework';
import { mockEnrolledProgramsResponse } from '__mocks__';

import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ProgramsOverview from './programs-overview.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchWorkspace: jest.fn(),
  };
});

const testProps = {
  basePath: `/patient/${mockPatient.id}/chart`,
  patientUuid: mockPatient.id,
};

describe('ProgramsOverview', () => {
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
    expect(screen.getByText(/Sorry, there was a problem displaying this information./)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's active program enrollments when available", async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });

    renderProgramsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /active programs/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date enrolled/i })).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /Add/ });
    const previousPageButton = screen.getByRole('button', { name: /previous page/i });
    const nextPageButton = screen.getByRole('button', { name: /next page/i });

    expect(addButton).toBeInTheDocument();
    expect(nextPageButton).toBeInTheDocument();
    expect(nextPageButton).toBeDisabled();
    expect(previousPageButton).toBeInTheDocument();
    expect(previousPageButton).toBeDisabled();
    expect(screen.getByRole('row', { name: /HIV Care and Treatment/i })).toBeInTheDocument();

    // Clicking "Add" launches the programs form in a workspace
    await user.click(addButton);

    expect(launchWorkspace).toHaveBeenCalledWith('programs-form-workspace');
  });
});

function renderProgramsOverview() {
  renderWithSwr(<ProgramsOverview {...testProps} />);
}
