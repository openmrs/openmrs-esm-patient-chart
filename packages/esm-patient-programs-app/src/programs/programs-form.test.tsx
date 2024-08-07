import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { type FetchResponse, showSnackbar, useLocations } from '@openmrs/esm-framework';
import { mockCareProgramsResponse, mockEnrolledProgramsResponse, mockLocationsResponse } from '__mocks__';
import { mockPatient } from 'tools';
import {
  createProgramEnrollment,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
} from './programs.resource';
import ProgramsForm from './programs-form.workspace';

const mockUseAvailablePrograms = jest.mocked(useAvailablePrograms);
const mockUseEnrollments = jest.mocked(useEnrollments);
const mockCreateProgramEnrollment = jest.mocked(createProgramEnrollment);
const mockUpdateProgramEnrollment = jest.mocked(updateProgramEnrollment);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseLocations = jest.mocked(useLocations);
const mockCloseWorkspace = jest.fn();
const mockCloseWorkspaceWithSavedChanges = jest.fn();
const mockPromptBeforeClosing = jest.fn();

const testProps = {
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspaceWithSavedChanges,
  patientUuid: mockPatient.id,
  promptBeforeClosing: mockPromptBeforeClosing,
  setTitle: jest.fn(),
};

jest.mock('./programs.resource', () => ({
  createProgramEnrollment: jest.fn(),
  updateProgramEnrollment: jest.fn(),
  useAvailablePrograms: jest.fn(),
  useEnrollments: jest.fn(),
}));

mockUseLocations.mockReturnValue(mockLocationsResponse);

mockUseAvailablePrograms.mockReturnValue({
  data: mockCareProgramsResponse,
  eligiblePrograms: [],
  error: null,
  isLoading: false,
});

mockUseEnrollments.mockReturnValue({
  data: mockEnrolledProgramsResponse,
  error: null,
  isLoading: false,
  isValidating: false,
  activeEnrollments: [],
  mutateEnrollments: jest.fn(),
});

mockCreateProgramEnrollment.mockResolvedValue({
  status: 201,
  statusText: 'Created',
} as unknown as FetchResponse);

describe('ProgramsForm', () => {
  it('renders a success toast notification upon successfully recording a program enrollment', async () => {
    const user = userEvent.setup();

    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';

    renderProgramsForm();

    const programNameInput = screen.getByRole('combobox', { name: /program name/i });
    const enrollmentDateInput = screen.getByRole('textbox', { name: /date enrolled/i });
    const enrollmentLocationInput = screen.getByRole('combobox', { name: /enrollment location/i });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(enrollButton);
    expect(screen.getByText(/program is required/i)).toBeInTheDocument();

    await user.type(enrollmentDateInput, '2020-05-05');
    await user.selectOptions(programNameInput, [oncologyScreeningProgramUuid]);
    await user.selectOptions(enrollmentLocationInput, [inpatientWardUuid]);
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();

    await user.click(enrollButton);

    expect(mockCreateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockCreateProgramEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        dateCompleted: null,
        location: inpatientWardUuid,
        patient: mockPatient.id,
        program: oncologyScreeningProgramUuid,
      }),
      new AbortController(),
    );

    expect(mockCloseWorkspaceWithSavedChanges).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'It is now visible in the Programs table',
      kind: 'success',
      title: 'Program enrollment saved',
    });
  });

  it('updates a program enrollment', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    const completionDateInput = screen.getByRole('textbox', { name: /date completed/i });

    mockUpdateProgramEnrollment.mockResolvedValue({
      status: 200,
      statusText: 'OK',
    } as unknown as FetchResponse);

    await user.type(completionDateInput, '05/05/2020');
    await user.tab();
    await user.click(enrollButton);

    expect(mockUpdateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockUpdateProgramEnrollment).toHaveBeenCalledWith(
      mockEnrolledProgramsResponse[0].uuid,
      expect.objectContaining({
        dateCompleted: expect.stringMatching(/^2020-05-05/),
        dateEnrolled: expect.stringMatching(/^2020-01-16/),
        location: mockEnrolledProgramsResponse[0].location.uuid,
        patient: mockPatient.id,
        program: mockEnrolledProgramsResponse[0].program.uuid,
      }),
      new AbortController(),
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'Changes to the program are now visible in the Programs table',
        kind: 'success',
        title: 'Program enrollment updated',
      }),
    );
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
