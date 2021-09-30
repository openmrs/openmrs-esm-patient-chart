import React from 'react';
import AppointmentForm from './appointments-form.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockLocations } from '../../../../__mocks__/location.mock';
import { useLocations, useSessionUser, detach } from '@openmrs/esm-framework';
import { mockSessionDataResponse } from '../../../../__mocks__/session.mock';
import { mockUseAppointmentServiceData } from '../../../../__mocks__/appointments.mock';
import { createAppointment } from './appointments.resource';
import useAppointmentService from '../hooks/useAppointmentService';

const mockCloseWorkspace = jest.fn();
const mockUseLocation = useLocations as jest.Mock;
const mockUserSession = useSessionUser as jest.Mock;
const mockCreateAppointment = createAppointment as jest.Mock;
const mockUseAppointmentService = useAppointmentService as jest.Mock;

jest.mock('../hooks/useAppointmentService', () => ({
  useAppointmentService: jest.fn(),
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useLocations: jest.fn(),
  useSessionUser: jest.fn(),
  showNotification: jest.fn(),
  showToast: jest.fn(),
}));

jest.mock('./appointments.resource', () => ({
  createAppointment: jest.fn(),
}));

describe('AppointmentForm', () => {
  const renderAppointmentForm = () => {
    mockUseLocation.mockReturnValue(mockLocations);
    mockUserSession.mockReturnValue(mockSessionDataResponse.data);
    mockUseAppointmentService.mockReturnValue({
      status: 'resolved',
      services: mockUseAppointmentServiceData,
      error: null,
    });
    render(<AppointmentForm closeWorkspace={mockCloseWorkspace} patientUuid={mockPatient.id} isTablet={true} />);
  };

  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2021, 9, 21));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should save patient appointments', async () => {
    renderAppointmentForm();
    expect(screen.getByRole('combobox', { name: /Location/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Select services$/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Select services type$/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select appointment kind/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save and Close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();

    // key in form values

    const timeInput = await screen.findByRole('textbox', { name: /Time/ });
    userEvent.type(timeInput, '11:30');

    const timeFormat = screen.getByRole('combobox', { name: /Time/ });
    userEvent.selectOptions(timeFormat, 'PM');

    const dateInput = screen.getByRole('textbox', { name: /Date/ });
    userEvent.type(dateInput, '21/09/2021');

    const servicesComboBox = screen.getByRole('combobox', { name: /^Select services$/i });
    userEvent.click(servicesComboBox);
    const servicesListBox = screen.getByRole('option', { name: /Outpatient/ });
    userEvent.click(servicesListBox);

    const locationComboBox = screen.getByRole('combobox', { name: /^Select a location$/i });
    userEvent.click(locationComboBox);
    const locationOption = screen.getByRole('option', { name: /Mosoriot/ });
    userEvent.click(locationOption);

    const serviceTypeComboBox = screen.getByRole('combobox', { name: /^Select services type$/i });
    userEvent.click(serviceTypeComboBox);
    const serviceTypeOption = screen.getByRole('option', { name: /Chemotherapy/ });
    userEvent.click(serviceTypeOption);

    const appointmentKindComboBox = screen.getByRole('combobox', { name: /^Select appointment kind$/i });
    userEvent.click(appointmentKindComboBox);
    const appointmentKindOption = screen.getByRole('option', { name: /WalkIn/ });
    userEvent.click(appointmentKindOption);

    const commentTextArea = screen.getByRole('textbox', { name: /Write an additional note/i });
    expect(commentTextArea).toBeInTheDocument();
    userEvent.type(commentTextArea, 'test appointment text');

    const saveAndCloseButton = screen.getByRole('button', { name: /Save and close/i });
    mockCreateAppointment.mockReturnValueOnce(Promise.resolve({ status: 200 }));
    userEvent.click(saveAndCloseButton);

    expect(createAppointment).toHaveBeenCalled();
    expect(createAppointment).toHaveBeenCalledWith(
      {
        appointmentKind: 'WalkIn',
        endDateTime: new Date('2021-10-21T21:15:00.000Z'),
        locationUuid: 'some-uuid1',
        patientUuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        providerUuid: 'b1a8b05e-3542-4037-bbd3-998ee9c4057z',
        providers: [{ comments: 'test appointment text', uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c4057z' }],
        serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
        startDateTime: new Date('2021-10-21T21:00:00.000Z'),
      },
      new AbortController(),
    );
  });

  it('should display error when saving bugs out', async () => {
    renderAppointmentForm();

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    const timeInput = await screen.findByRole('textbox', { name: /Time/ });
    userEvent.type(timeInput, '11:30');

    const timeFormat = screen.getByRole('combobox', { name: /Time/ });
    userEvent.selectOptions(timeFormat, 'PM');

    const dateInput = screen.getByRole('textbox', { name: /Date/ });
    userEvent.type(dateInput, '21/09/2021');

    const servicesComboBox = screen.getByRole('combobox', { name: /^Select services$/i });
    userEvent.click(servicesComboBox);
    const servicesListBox = screen.getByRole('option', { name: /Outpatient/ });
    userEvent.click(servicesListBox);

    const serviceTypeComboBox = screen.getByRole('combobox', { name: /^Select services type$/i });
    userEvent.click(serviceTypeComboBox);
    const serviceTypeOption = screen.getByRole('option', { name: /Chemotherapy/ });
    userEvent.click(serviceTypeOption);

    const appointmentKindComboBox = screen.getByRole('combobox', { name: /^Select appointment kind$/i });
    userEvent.click(appointmentKindComboBox);
    const appointmentKindOption = screen.getByRole('option', { name: /WalkIn/ });
    userEvent.click(appointmentKindOption);

    const saveAndCloseButton = screen.getByRole('button', { name: /Save and close/i });
    mockCreateAppointment.mockReturnValue(Promise.reject(error));
    userEvent.click(saveAndCloseButton);
  });

  it('should close the appointment form on click discard button', () => {
    renderAppointmentForm();

    const discardButton = screen.getByRole('button', { name: /Discard/i });
    expect(discardButton).toBeInTheDocument();

    userEvent.click(discardButton);
    expect(detach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'appointment-form-workspace');
  });
});
