import React from 'react';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createErrorHandler, openmrsFetch, showNotification, showToast } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse,
  mockLocationsResponse,
} from '../../../../__mocks__/programs.mock';
import { createProgramEnrollment, updateProgramEnrollment } from './programs.resource';
import ProgramsForm from './programs-form.component';

jest.setTimeout(20000);

const testProps = {
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
};

const mockCreateErrorHandler = createErrorHandler as jest.Mock;
const mockCreateProgramEnrollment = createProgramEnrollment as jest.Mock;
const mockUpdateProgramEnrollment = updateProgramEnrollment as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    createErrorHandler: jest.fn(),
    showNotification: jest.fn(),
    showToast: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocationsResponse),
  };
});

jest.mock('./programs.resource', () => {
  const originalModule = jest.requireActual('./programs.resource');

  return {
    ...originalModule,
    createProgramEnrollment: jest.fn(),
    updateProgramEnrollment: jest.fn(),
  };
});

describe('ProgramsForm', () => {
  it('renders a success toast notification upon successfully recording a program enrollment', async () => {
    const user = userEvent.setup();

    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });
    mockCreateProgramEnrollment.mockReturnValueOnce(of({ status: 201, statusText: 'Created' }));

    renderProgramsForm();

    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    const enrollmentDateInput = screen.getAllByRole('textbox', { name: '' })[0];
    const selectLocationInput = screen.getAllByRole('combobox', { name: '' })[1];
    const selectProgramInput = screen.getAllByRole('combobox', { name: '' })[0];

    await waitFor(() => user.type(enrollmentDateInput, '2020-05-05'));
    await waitFor(() => user.selectOptions(selectProgramInput, [oncologyScreeningProgramUuid]));
    await waitFor(() => user.selectOptions(selectLocationInput, [inpatientWardUuid]));

    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();

    await waitFor(() => user.click(enrollButton));

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

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      critical: true,
      description: 'It is now visible in the Programs table',
      kind: 'success',
      title: 'Program enrollment saved',
    });
  });

  it('updates a program enrollment', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    const dateCompletedGroup = screen.getByRole('group', { name: /Date completed/i });
    const dateCompletedInput = within(dateCompletedGroup).getByRole('textbox');

    mockUpdateProgramEnrollment.mockReturnValueOnce(of({ status: 200, statusText: 'OK' }));

    await waitFor(() => user.type(dateCompletedInput, '05/05/2020'));

    expect(dateCompletedInput).toHaveValue('05/05/2020');

    await waitFor(() => user.tab());

    expect(enrollButton).not.toBeDisabled();

    await waitFor(() => user.click(enrollButton));

    expect(mockUpdateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockUpdateProgramEnrollment).toHaveBeenCalledWith(
      mockEnrolledProgramsResponse[0].uuid,
      expect.objectContaining({
        dateEnrolled: '2020-01-16T00:00:00+00:00',
        dateCompleted: '2020-05-05T00:00:00+00:00',
        location: mockEnrolledProgramsResponse[0].location.uuid,
        patient: mockPatient.id,
        program: mockEnrolledProgramsResponse[0].program.uuid,
      }),
      new AbortController(),
    );

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        critical: true,
        description: 'Changes to the program are now visible in the Programs table',
        kind: 'success',
        title: 'Program enrollment updated',
      }),
    );
  });

  it('renders an error notification if there was a problem recording a program enrollment', async () => {
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
    mockCreateProgramEnrollment.mockReturnValueOnce(throwError(error));

    renderProgramsForm();

    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    const enrollmentDateInput = screen.getAllByRole('textbox', { name: '' })[0];
    const selectLocationInput = screen.getAllByRole('combobox', { name: '' })[1];
    const selectProgramInput = screen.getAllByRole('combobox', { name: '' })[0];

    await waitFor(() => user.type(enrollmentDateInput, '2020-05-05'));
    await waitFor(() => user.selectOptions(selectProgramInput, [oncologyScreeningProgramUuid]));
    await waitFor(() => user.selectOptions(selectLocationInput, [inpatientWardUuid]));

    expect(enrollButton).not.toBeDisabled();

    await waitFor(() => user.click(enrollButton));

    expect(mockCreateErrorHandler).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error saving program enrollment',
    });
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
