import React from 'react';
import AppointmentBase from './appointment-base.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { useAppointments } from '../hooks/useAppointments';
import { mockAppointmentsData } from '../../../../__mocks__/appointments.mock';
import { usePagination, attach } from '@openmrs/esm-framework';

const mockUsePagination = usePagination as jest.Mock;
const mockUseAppointments = useAppointments as jest.Mock;
const mockAttach = attach as jest.Mock;

jest.mock('../hooks/useAppointments', () => ({
  useAppointments: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  usePagination: jest.fn(),
  attach: jest.fn(),
}));

describe('AppointmentBase', () => {
  const renderAppointments = () => {
    mockUseAppointments.mockReturnValue({ ...mockAppointmentsData, status: 'resolved', error: null });
    mockUsePagination.mockReturnValue({
      results: mockAppointmentsData.upComingAppointments,
      goTo: () => {},
      currentPage: 1,
    });
    return render(<AppointmentBase patientUuid={mockPatient.id} />);
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render an empty state when no appointment are available', () => {
    mockUseAppointments.mockReturnValue({
      patientAppointments: [],
      pastAppointments: [],
      upcomingAppointments: [],
      status: 'resolved',
      error: null,
    });
    render(<AppointmentBase patientUuid={mockPatient.id} />);

    expect(screen.getByText(/There are no appointments to display for this patient/i)).toBeInTheDocument();
    const launchAppointmentsForm = screen.getByText(/Record appointments/);
    userEvent.click(launchAppointmentsForm);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'appointment-form-workspace');
  });

  it('should render upcoming appointments by default', () => {
    renderAppointments();

    expect(screen.getByText('Appointments')).toBeInTheDocument();
    const upcomingTab = screen.getByRole('tab', { name: /Upcoming/ });
    expect(upcomingTab).toBeInTheDocument();
    const pastTab = screen.getByRole('tab', { name: /Past/ });
    expect(pastTab).toBeInTheDocument();

    // Upcomming appointment selected
    expect(upcomingTab).toHaveAttribute('aria-selected', 'true');
    expect(pastTab).toHaveAttribute('aria-selected', 'false');

    // Switch between upcoming and past appointment
    userEvent.click(pastTab);
    expect(upcomingTab).toHaveAttribute('aria-selected', 'false');
    expect(pastTab).toHaveAttribute('aria-selected', 'true');

    const launchAppointmentForm = screen.getByRole('button', { name: /Add/i });
    userEvent.click(launchAppointmentForm);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'appointment-form-workspace');
  });

  it('should display error state', () => {
    const mockError = {
      message: 'API Down',
      response: {
        status: 500,
        statusText: 'API is down',
      },
    };
    mockUseAppointments.mockReturnValue({ ...mockAppointmentsData, status: 'error', error: mockError });
    render(<AppointmentBase patientUuid={mockPatient.id} />);

    expect(screen.getByText(/Appointments/)).toBeInTheDocument();
    expect(screen.getByText(/API is down/)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  it('should render appointment table correctly', () => {
    const { container } = renderAppointments();

    // Contains table headers
    expect(screen.getByRole('columnheader', { name: /Date/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Location/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Service/ })).toBeInTheDocument();

    // Display correct rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3);
    expect(screen.getByRole('cell', { name: /InPatient/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /MTRH Clinic/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /14 - Sep -2021 , 10:09/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Isolation Ward/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /14 - Sep -2021 , 15:09/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Outpatient/ })).toBeInTheDocument();
  });
});
