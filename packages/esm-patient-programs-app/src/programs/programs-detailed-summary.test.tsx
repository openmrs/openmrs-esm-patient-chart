import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { mockCareProgramsResponse, mockEnrolledInAllProgramsResponse, mockEnrolledProgramsResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import ProgramsDetailedSummary from './programs-detailed-summary.component';

const mockLaunchWorkspace = jest.mocked(launchWorkspace);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('ProgramsDetailedSummary', () => {
  it('renders an empty state view when the patient is not enrolled into any programs', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<ProgramsDetailedSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no program enrollments to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record program enrollments/i)).toBeInTheDocument();
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

    renderWithSwr(<ProgramsDetailedSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./,
      ),
    ).toBeInTheDocument();
  });

  it('renders a detailed tabular summary of the patient program enrollments', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });

    renderWithSwr(<ProgramsDetailedSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /active programs/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date enrolled/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /hiv care and treatment/i });
    expect(row).toBeInTheDocument();
    expect(within(row).getByRole('cell', { name: /16-Jan-2020/i })).toBeInTheDocument();
    expect(within(row).getByRole('cell', { name: /active$/i })).toBeInTheDocument();
    const actionMenuButton = within(row).getByRole('button', { name: /options$/i });
    expect(actionMenuButton).toBeInTheDocument();

    await user.click(actionMenuButton);

    // Clicking "Add" launches the programs form in a workspace
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

  it('renders a notification when the patient is enrolled in all available programs', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledInAllProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });

    renderWithSwr(<ProgramsDetailedSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('row', { name: /hiv care and treatment/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv differentiated care/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /oncology screening and diagnosis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
    expect(screen.getByText(/enrolled in all programs/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no more programs left to enroll this patient in/i)).toBeInTheDocument();
  });

  it('conditionally renders the programs status field', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showProgramStatusField: true,
    });

    renderWithSwr(<ProgramsDetailedSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('columnheader', { name: /program status/i })).toBeInTheDocument();
  });
});
