import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { launchWorkspace, openmrsFetch } from '@openmrs/esm-framework';
import { mockCareProgramsResponse, mockEnrolledInAllProgramsResponse, mockEnrolledProgramsResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ProgramsOverview from './programs-overview.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockLaunchWorkspace = jest.mocked(launchWorkspace);

const testProps = {
  basePath: `/patient/${mockPatient.id}/chart`,
  patientUuid: mockPatient.id,
};

describe('ProgramsOverview', () => {
  it('renders an empty state view when the patient is not enrolled into any programs', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<ProgramsOverview {...testProps} />);

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

    renderWithSwr(<ProgramsOverview {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information./)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's active program enrollments when available", async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });

    renderWithSwr(<ProgramsOverview {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /active programs/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date enrolled/i })).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add/i });
    const previousPageButton = screen.getByRole('button', { name: /previous page/i });
    const nextPageButton = screen.getByRole('button', { name: /next page/i });

    expect(addButton).toBeInTheDocument();
    expect(nextPageButton).toBeInTheDocument();
    expect(nextPageButton).toBeDisabled();
    expect(previousPageButton).toBeInTheDocument();
    expect(previousPageButton).toBeDisabled();
    const row = screen.getByRole('row', { name: /HIV Care and Treatment/i });
    expect(row).toBeInTheDocument();
    const actionMenuButton = within(row).getByRole('button', { name: /options$/i });
    expect(actionMenuButton).toBeInTheDocument();

    expect(addButton).toBeEnabled();
    await user.click(addButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('programs-form-workspace');

    await user.click(actionMenuButton);
    await user.click(screen.getByText('Edit'));

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('programs-form-workspace', {
      programEnrollmentId: mockEnrolledProgramsResponse[0].uuid,
      workspaceTitle: 'Edit program enrollment',
    });
  });

  it('renders a notification if the patient is already enrolled in all available programs', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledInAllProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });

    renderWithSwr(<ProgramsOverview {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('row', { name: /hiv care and treatment/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv differentiated care/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /oncology screening and diagnosis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
    expect(screen.getByText(/enrolled in all programs/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no more programs left to enroll this patient in/i)).toBeInTheDocument();
  });
});
