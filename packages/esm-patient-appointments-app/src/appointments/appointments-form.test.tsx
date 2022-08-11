import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockLocations, mockLocationsDataResponse } from '../../../../__mocks__/location.mock';
import { openmrsFetch, showNotification, showToast } from '@openmrs/esm-framework';
import { mockSessionDataResponse } from '../../../../__mocks__/session.mock';
import { mockAppointmentsData, mockUseAppointmentServiceData } from '../../../../__mocks__/appointments.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { createAppointment } from './appointments.resource';
import AppointmentForm from './appointments-form.component';

const testProps = {
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
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
    useSession: jest.fn().mockImplementation(() => mockSessionDataResponse.data),
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
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(mockAppointmentsData);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    await waitFor(() => user.click(cancelButton));

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders a success toast notification upon successfully scheduling an appointment', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: mockUseAppointmentServiceData });
    mockCreateAppointment.mockResolvedValueOnce({ status: 200, statusText: 'Ok' });

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /Date/i });
    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    const serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /Select the type of service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });

    expect(saveButton).toBeDisabled();

    await waitFor(() => user.clear(dateInput));
    await waitFor(() => user.type(dateInput, '4/4/2021'));
    await waitFor(() => user.clear(timeInput));
    await waitFor(() => user.type(timeInput, '09:30'));
    await waitFor(() => user.selectOptions(timeFormat, 'AM'));
    await waitFor(() => user.selectOptions(serviceSelect, ['Outpatient']));
    await waitFor(() => user.selectOptions(serviceTypeSelect, ['Chemotherapy']));
    await waitFor(() => user.selectOptions(appointmentTypeSelect, ['Scheduled']));

    expect(saveButton).not.toBeDisabled();

    await waitFor(() => user.click(saveButton));

    expect(mockCreateAppointment).toHaveBeenCalledTimes(1);
    expect(mockCreateAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentKind: 'Scheduled',
        serviceUuid: mockUseAppointmentServiceData[0].uuid,
        providerUuid: mockSessionDataResponse.data.currentProvider.uuid,
        providers: [{ uuid: mockSessionDataResponse.data.currentProvider.uuid, comments: '' }],
        locationUuid: mockLocationsDataResponse.data.results[1].uuid,
        patientUuid: mockPatient.id,
      }),
      new AbortController(),
    );

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
    const user = userEvent.setup();

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockOpenmrsFetch.mockReturnValueOnce({ data: mockUseAppointmentServiceData });
    mockCreateAppointment.mockRejectedValueOnce(error);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /Date/i });
    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    const serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /Select the type of service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });

    await waitFor(() => user.clear(dateInput));
    await waitFor(() => user.type(dateInput, '4/4/2021'));
    await waitFor(() => user.clear(timeInput));
    await waitFor(() => user.type(timeInput, '09:30'));
    await waitFor(() => user.selectOptions(timeFormat, 'AM'));
    await waitFor(() => user.selectOptions(serviceSelect, ['Outpatient']));
    await waitFor(() => user.selectOptions(serviceTypeSelect, ['Chemotherapy']));
    await waitFor(() => user.selectOptions(appointmentTypeSelect, ['Scheduled']));
    await waitFor(() => user.click(saveButton));

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error scheduling appointment',
    });
  });
});

function renderAppointmentsForm() {
  renderWithSwr(<AppointmentForm {...testProps} />);
}
