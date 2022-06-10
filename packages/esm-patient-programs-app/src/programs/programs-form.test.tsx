import React from 'react';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createErrorHandler,
  formatDate,
  openmrsFetch,
  parseDate,
  showNotification,
  showToast,
  useLayoutType,
} from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse,
  mockLocationsResponse,
  mockProgramResponse,
} from '../../../../__mocks__/programs.mock';
import { createProgramEnrollment, updateProgramEnrollment } from './programs.resource';
import ProgramsForm from './programs-form.component';

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
const mockUseLayoutType = useLayoutType as jest.Mock;

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

mockOpenmrsFetch.mockImplementation((url) => {
  if (/programenrollment/.test(url)) {
    return { data: { results: mockEnrolledProgramsResponse } };
  } else if (/program/.test(url)) {
    return { data: { results: mockCareProgramsResponse } };
  } else {
    return null;
  }
});

describe('ProgramsForm: ', () => {
  it('renders the programs form with all the relevant fields and values', async () => {
    renderProgramsForm();

    await screen.findByRole('group', { name: /Program/i });
    expect(screen.getByRole('group', { name: /Date enrolled/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Date completed/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Enrollment location/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choose a program/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Oncology Screening and Diagnosis/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choose a location/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Amani Hospital/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Isolation Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Laboratory/i })).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).toBeDisabled();
  });

  it('renders the edit program form with existing data', async () => {
    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

    const programSelect = await screen.findByRole('group', { name: /Program/i });
    expect(within(programSelect).getByRole('option', { name: /HIV Care and Treatment/ })).toBeInTheDocument();
    expect(within(programSelect).getAllByRole('option').length).toBe(1);

    const dateEnrolledGroup = screen.getByRole('group', { name: /Date enrolled/i });
    expect(dateEnrolledGroup).toBeInTheDocument();
    const dateEnrolledInput = within(dateEnrolledGroup).getByRole('textbox');
    expect(dateEnrolledInput).toHaveValue('16/01/2020');

    expect(screen.getByRole('group', { name: /Date completed/i })).toBeInTheDocument();

    const enrollmentLocation = screen.getByRole('group', { name: /Enrollment location/i });
    const locationSelect = within(enrollmentLocation).getByRole('combobox');
    const amani = screen.getByRole('option', { name: /Amani Hospital/i });
    expect(amani).toBeInTheDocument();
    expect(locationSelect).toHaveValue(mockLocationsResponse[0].uuid);
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Isolation Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Laboratory/i })).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).not.toBeDisabled();
  });

  it('closes the form and the workspace when the cancel button is clicked', () => {
    renderProgramsForm();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    userEvent.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  describe('Form submission: ', () => {
    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';

    beforeEach(() => {
      mockShowToast.mockReset();
    });

    it('creates a program enrollment', async () => {
      renderProgramsForm();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const enrollButton = screen.getByRole('button', { name: /save and close/i });
      const enrollmentDateInput = screen.getAllByRole('textbox', { name: '' })[0];
      const selectLocationInput = screen.getAllByRole('combobox', { name: '' })[1];
      const selectProgramInput = screen.getAllByRole('combobox', { name: '' })[0];

      mockCreateProgramEnrollment.mockReturnValueOnce(of({ status: 201, statusText: 'Created' }));

      userEvent.selectOptions(selectProgramInput, [oncologyScreeningProgramUuid]);
      userEvent.selectOptions(selectLocationInput, [inpatientWardUuid]);
      userEvent.clear(enrollmentDateInput);
      userEvent.type(enrollmentDateInput, '05/05/2020');
      fireEvent.blur(enrollmentDateInput);

      expect(screen.getByDisplayValue('Oncology Screening and Diagnosis')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Inpatient Ward')).toBeInTheDocument();
      expect(enrollButton).not.toBeDisabled();

      await waitFor(() => userEvent.click(enrollButton));

      expect(mockCreateProgramEnrollment).toHaveBeenCalledTimes(1);
      expect(mockCreateProgramEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({
          dateEnrolled: '2020-05-05T00:00:00+00:00',
          dateCompleted: null,
          location: inpatientWardUuid,
          patient: mockPatient.id,
          program: oncologyScreeningProgramUuid,
        }),
        new AbortController(),
      );

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          critical: true,
          description: 'It is now visible in the Programs table',
          kind: 'success',
          title: 'Program enrollment saved',
        }),
      );
    });

    it('updates a program enrollment', async () => {
      renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

      const enrollButton = screen.getByRole('button', { name: /save and close/i });
      const dateCompletedGroup = screen.getByRole('group', { name: /Date completed/i });
      const dateCompletedInput = within(dateCompletedGroup).getByRole('textbox');

      mockUpdateProgramEnrollment.mockReturnValueOnce(of({ status: 200, statusText: 'OK' }));

      userEvent.type(dateCompletedInput, '05/05/2020');
      expect(dateCompletedInput).toHaveValue('05/05/2020');
      fireEvent.blur(dateCompletedInput);

      expect(enrollButton).not.toBeDisabled();

      await waitFor(() => userEvent.click(enrollButton));

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

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          critical: true,
          description: 'Changes to the program are now visible in the Programs table',
          kind: 'success',
          title: 'Program enrollment updated',
        }),
      );
    });

    xit('renders an error notification if there was a problem recording a program enrollment', async () => {
      renderProgramsForm();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const enrollButton = screen.getByRole('button', { name: /save and close/i });
      const enrollmentDateInput = screen.getAllByRole('textbox', { name: '' })[0];
      const selectLocationInput = screen.getAllByRole('combobox', { name: '' })[1];
      const selectProgramInput = screen.getAllByRole('combobox', { name: '' })[0];

      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      mockCreateProgramEnrollment.mockReturnValueOnce(throwError(error));

      userEvent.selectOptions(selectProgramInput, [oncologyScreeningProgramUuid]);
      userEvent.selectOptions(selectLocationInput, [inpatientWardUuid]);
      userEvent.type(enrollmentDateInput, '2020-05-05');

      expect(screen.getByDisplayValue('Oncology Screening and Diagnosis')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2020-05-05')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Inpatient Ward')).toBeInTheDocument();
      expect(enrollButton).not.toBeDisabled();

      userEvent.click(enrollButton);

      expect(mockCreateErrorHandler).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith({
        critical: true,
        description: 'Internal Server Error',
        kind: 'error',
        title: 'Error saving program enrollment',
      });
    });
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
