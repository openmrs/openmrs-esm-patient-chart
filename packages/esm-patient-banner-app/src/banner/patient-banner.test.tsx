import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import PatientBanner from './patient-banner.component';

const testProps = {
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

const mockNavigateTo = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
  age: jest.fn(),
}));

describe('PatientBanner: ', () => {
  it('renders information about a patient in a banner above the patient chart', () => {
    renderPatientBanner();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveClass('patientAvatar');
    expect(screen.getByText(/John Wilson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Actions$/i })).toBeInTheDocument();
    expect(screen.getByText(/04 — Apr — 1972/i)).toBeInTheDocument();
    expect(screen.getByText(/100GEJ/i)).toBeInTheDocument();
    expect(screen.getByText(/100732HE/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenMRS ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Old Identification Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Show details$/i })).toBeInTheDocument();
  });

  it("can toggle between showing or hiding the patient's contact details", async () => {
    const user = userEvent.setup();

    renderPatientBanner();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show details$/i,
    });

    await waitFor(() => user.click(showContactDetailsBtn));

    const hideDetailsBtn = screen.getByRole('button', {
      name: /^Hide details$/i,
    });
    expect(hideDetailsBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();

    await waitFor(() => user.click(hideDetailsBtn));

    expect(showContactDetailsBtn).toBeInTheDocument();
  });

  it('should allow navigate to patient-chart on patient-search', async () => {
    const user = userEvent.setup();

    const patientBannerSeachPageProps = { ...testProps, onClick: mockNavigateTo };
    render(<PatientBanner {...patientBannerSeachPageProps} />);

    const imgAvatar = screen.getByRole('img');

    await waitFor(() => user.click(imgAvatar));

    expect(mockNavigateTo).toHaveBeenCalledWith(patientBannerSeachPageProps.patientUuid);
    mockNavigateTo.mockClear();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show details$/i,
    });

    await waitFor(() => user.click(showContactDetailsBtn));

    expect(mockNavigateTo).toHaveBeenCalledTimes(1);

    const hideDetailsBtn = screen.getByRole('button', {
      name: /^Hide details$/i,
    });
    expect(hideDetailsBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();
  });
});

function renderPatientBanner() {
  render(<PatientBanner {...testProps} />);
}
