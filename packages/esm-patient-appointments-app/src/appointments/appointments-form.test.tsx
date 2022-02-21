import React from 'react';
import dayjs from 'dayjs';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockLocations, mockLocationsDataResponse } from '../../../../__mocks__/location.mock';
import { openmrsFetch, showNotification, showToast } from '@openmrs/esm-framework';
import { mockSessionDataResponse } from '../../../../__mocks__/session.mock';
import { mockAppointmentsData, mockUseAppointmentServiceData } from '../../../../__mocks__/appointments.mock';
import { swrRender, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { createAppointment } from './appointments.resource';
import AppointmentForm from './appointments-form.component';

const closeWorkspace = jest.fn();

const testProps = {
  closeWorkspace,
  patientUuid: mockPatient.id,
};

const mockCreateAppointment = createAppointment as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLocations: jest.fn().mockImplementation(() => mockLocations),
    useSessionUser: jest.fn().mockImplementation(() => mockSessionDataResponse.data),
    showToast: jest.fn(),
  };
});

jest.mock('./appointments.resource', () => {
  const originalModule = jest.requireActual('./appointments.resource');

  return {
    ...originalModule,
    createAppointment: jest.fn(),
  };
});

describe('AppointmentForm', () => {
  beforeEach(() => {
    closeWorkspace.mockReset();
  });

  it('renders the appointments form showing all the relevant fields and values', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(mockUseAppointmentServiceData);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    expect(screen.getByLabelText(/Select a location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select a service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select the type of service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select the type of appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Write an additional note/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write any additional points here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/dd\/mm\/yyyy/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choose appointment type/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /WalkIn/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
  });

  it('closes the form and the workspace when the cancel button is clicked', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(mockAppointmentsData);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    userEvent.click(cancelButton);

    expect(closeWorkspace).toHaveBeenCalledTimes(1);
  });

  describe('Form submission', () => {
    let discardButton: HTMLElement;
    let saveButton: HTMLElement;
    let dateInput: HTMLElement;
    let timeInput: HTMLElement;
    let timeFormat: HTMLElement;
    let serviceSelect: HTMLElement;
    let serviceTypeSelect: HTMLElement;
    let appointmentTypeSelect: HTMLElement;
    let noteTextbox: HTMLElement;

    beforeEach(async () => {
      mockOpenmrsFetch.mockReturnValueOnce({ data: mockUseAppointmentServiceData });

      renderAppointmentsForm();

      await waitForLoadingToFinish();

      discardButton = screen.getByRole('button', { name: /Discard/i });
      saveButton = screen.getByRole('button', { name: /Save and close/i });
      dateInput = screen.getByRole('textbox', { name: /Date/i });
      timeInput = screen.getByRole('textbox', { name: /Time/i });
      timeFormat = screen.getByRole('combobox', { name: /Time/i });
      serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
      serviceTypeSelect = screen.getByRole('combobox', { name: /Select the type of service/i });
      appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });
      noteTextbox = screen.getByRole('textbox', { name: /Write an additional note/i });
    });

    it('renders a success toast notification upon successfully scheduling an appointment', async () => {
      const promise = Promise.resolve();
      mockCreateAppointment.mockResolvedValueOnce({ status: 200, statusText: 'Ok' });

      expect(saveButton).toBeDisabled();

      userEvent.clear(dateInput);
      userEvent.type(dateInput, '4/4/2021');
      userEvent.clear(timeInput);
      userEvent.type(timeInput, '09:30');
      userEvent.selectOptions(timeFormat, 'AM');
      userEvent.selectOptions(serviceSelect, ['Outpatient']);
      userEvent.selectOptions(serviceTypeSelect, ['Chemotherapy']);
      userEvent.selectOptions(appointmentTypeSelect, ['Scheduled']);

      expect(saveButton).not.toBeDisabled();

      userEvent.click(saveButton);

      expect(mockCreateAppointment).toHaveBeenCalledTimes(1);
      expect(mockCreateAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentKind: 'Scheduled',
          serviceUuid: mockUseAppointmentServiceData[0].uuid,
          startDateTime: dayjs(new Date('2021-04-04T09:30:00')).format(),
          endDateTime: dayjs(new Date('2021-04-04T09:45:00')).format(),
          providerUuid: mockSessionDataResponse.data.currentProvider.uuid,
          providers: [{ uuid: mockSessionDataResponse.data.currentProvider.uuid, comments: '' }],
          locationUuid: mockLocationsDataResponse.data.results[1].uuid,
          patientUuid: mockPatient.id,
        }),
        new AbortController(),
      );

      await act(() => promise);

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          critical: true,
          description: 'It is now visible on the Appointments page',
          kind: 'success',
          title: 'Appointment scheduled',
        }),
      );
    });

    it('renders an error notification if there was a problem scheduling an appointment', async () => {
      const promise = Promise.resolve();

      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      mockCreateAppointment.mockRejectedValueOnce(error);

      userEvent.clear(dateInput);
      userEvent.type(dateInput, '4/4/2021');
      userEvent.clear(timeInput);
      userEvent.type(timeInput, '09:30');
      userEvent.selectOptions(timeFormat, 'AM');
      userEvent.selectOptions(serviceSelect, ['Outpatient']);
      userEvent.selectOptions(serviceTypeSelect, ['Chemotherapy']);
      userEvent.selectOptions(appointmentTypeSelect, ['Scheduled']);
      userEvent.click(saveButton);

      await act(() => promise);

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith({
        critical: true,
        description: 'Internal Server Error',
        kind: 'error',
        title: 'Error scheduling appointment',
      });
    });
  });
});

function renderAppointmentsForm() {
  swrRender(<AppointmentForm {...testProps} />);
}
