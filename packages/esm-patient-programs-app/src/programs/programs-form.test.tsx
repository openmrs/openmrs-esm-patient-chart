import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockCareProgramsResponse, mockEnrolledProgramsResponse, mockLocationsResponse } from '__mocks__';
import { createProgramEnrollment, updateProgramEnrollment } from './programs.resource';
import ProgramsForm from './programs-form.workspace';

const mockCreateProgramEnrollment = createProgramEnrollment as jest.Mock;
const mockUpdateProgramEnrollment = updateProgramEnrollment as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockCloseWorkspaceWithSavedChanges = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLocations: jest.fn().mockImplementation(() => mockLocationsResponse),
}));

jest.mock('./programs.resource', () => ({
  ...jest.requireActual('./programs.resource'),
  createProgramEnrollment: jest.fn(),
  updateProgramEnrollment: jest.fn(),
  useEnrollments: jest.fn().mockReturnValue({
    data: mockEnrolledProgramsResponse,
    isLoading: false,
    isError: null,
    mutateEnrollments: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('ProgramsForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders a success toast notification upon successfully recording a program enrollment', async () => {
    const user = userEvent.setup();

    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });
    mockCreateProgramEnrollment.mockResolvedValueOnce({ status: 201, statusText: 'Created' });

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

    mockUpdateProgramEnrollment.mockResolvedValueOnce({ status: 200, statusText: 'OK' });

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

  xit('renders an error notification if there was a problem recording a program enrollment', async () => {
    const user = userEvent.setup();

    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });
    mockCreateProgramEnrollment.mockRejectedValueOnce(error);

    renderProgramsForm();

    const programNameInput = screen.getByRole('combobox', { name: /program name/i });
    const enrollmentDateInput = screen.getByRole('textbox', { name: /date enrolled/i });
    const enrollmentLocationInput = screen.getByRole('combobox', { name: /enrollment location/i });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });

    await user.type(enrollmentDateInput, '2020-05-05');
    await user.selectOptions(programNameInput, [oncologyScreeningProgramUuid]);
    await user.selectOptions(enrollmentLocationInput, [inpatientWardUuid]);

    expect(enrollButton).toBeEnabled();

    await user.click(enrollButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'An unknown error occurred',
      kind: 'error',
      title: 'Error saving program enrollment',
    });
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  const testProps = {
    closeWorkspace: jest.fn(),
    closeWorkspaceWithSavedChanges: mockCloseWorkspaceWithSavedChanges,
    patientUuid: mockPatient.id,
    promptBeforeClosing: jest.fn(),
    setTitle: jest.fn(),
  };

  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
