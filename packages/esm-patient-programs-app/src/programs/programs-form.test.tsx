import React from 'react';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createErrorHandler, openmrsFetch, showNotification, showToast, useLayoutType } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse,
  mockLocationsResponse,
} from '../../../../__mocks__/programs.mock';
import { createProgramEnrollment } from './programs.resource';
import ProgramsForm from './programs-form.component';

const testProps = {
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
};

const mockCreateErrorHandler = createErrorHandler as jest.Mock;
const mockCreateProgramEnrollment = createProgramEnrollment as jest.Mock;
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
  };
});

describe('ProgramsForm: ', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockCareProgramsResponse } });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockEnrolledProgramsResponse } });
  });

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

  it('closes the form and the workspace when the cancel button is clicked', () => {
    renderProgramsForm();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    userEvent.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders a light background for date inputs in the tablet viewport ', () => {
    mockUseLayoutType.mockReturnValueOnce('tablet').mockReturnValueOnce('tablet');

    renderProgramsForm();

    expect(screen.getAllByPlaceholderText('dd/mm/yyyy')[0]).toHaveClass('bx--date-picker--light', { exact: false });
    expect(screen.getAllByPlaceholderText('dd/mm/yyyy')[1]).toHaveClass('bx--date-picker--light', { exact: false });
  });

  describe('Form submission: ', () => {
    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const oncologyScreeningProgramUuid = '11b129ca-a5e7-4025-84bf-b92a173e20de';
    let cancelButton: HTMLElement;
    let enrollButton: HTMLElement;
    let enrollmentDateInput: HTMLElement;
    let selectLocationInput: HTMLElement;
    let selectProgramInput: HTMLElement;

    beforeEach(() => {
      renderProgramsForm();

      cancelButton = screen.getByRole('button', { name: /cancel/i });
      enrollButton = screen.getByRole('button', { name: /save and close/i });
      enrollmentDateInput = screen.getAllByRole('textbox', { name: '' })[0];
      selectLocationInput = screen.getAllByRole('combobox', { name: '' })[1];
      selectProgramInput = screen.getAllByRole('combobox', { name: '' })[0];
    });

    it('renders a success toast notification upon successfully recording a program enrollment', async () => {
      mockCreateProgramEnrollment.mockReturnValueOnce(of({ status: 201, statusText: 'Created' }));

      userEvent.selectOptions(selectProgramInput, [oncologyScreeningProgramUuid]);
      userEvent.selectOptions(selectLocationInput, [inpatientWardUuid]);
      userEvent.type(enrollmentDateInput, '2020-05-05');

      expect(screen.getByDisplayValue('Oncology Screening and Diagnosis')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Inpatient Ward')).toBeInTheDocument();
      expect(enrollButton).not.toBeDisabled();

      await waitFor(() => userEvent.click(enrollButton));

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
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          critical: true,
          description: 'It is now visible on the Programs page',
          kind: 'success',
          title: 'Program enrollment saved',
        }),
      );
    });

    xit('renders an error notification if there was a problem recording a program enrollment', async () => {
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

function renderProgramsForm() {
  render(<ProgramsForm {...testProps} />);
}
