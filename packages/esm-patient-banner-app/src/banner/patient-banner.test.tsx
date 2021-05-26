import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientBanner from './patient-banner.component';
import { openmrsObservableFetch, openmrsFetch, useVisit, age } from '@openmrs/esm-framework';
import { mockCurrentVisit, mockVisits } from '../../../../__mocks__/visits.mock';
import { of } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';

const mockUseVisit = useVisit as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockAge = age as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework/mock'),
  useVisit: jest.fn(),
  age: jest.fn(),
}));

jest.unmock('lodash');
const lodash = jest.requireActual('lodash');
lodash.capitalize = jest.fn().mockImplementation((s) => s.charAt(0).toUpperCase() + s.slice(1));

function renderPatientBanner() {
  mockAge.mockReturnValue('49 years');
  mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, error: null });
  mockOpenmrsObservableFetch.mockReturnValue(of(mockVisits));
  mockOpenmrsFetch.mockReturnValue(Promise.resolve([]));
  render(<PatientBanner patientUuid={mockPatient.id} patient={mockPatient} />);
}

function renderEmptyPatientBanner() {
  mockAge.mockReturnValue('49 years');
  mockUseVisit.mockReturnValue({
    currentVisit: undefined,
    error: null,
  });
  mockOpenmrsObservableFetch.mockReturnValue(of([]));
  mockOpenmrsFetch.mockReturnValue(Promise.resolve([]));
  render(<PatientBanner patientUuid={mockPatient.id} patient={mockPatient} />);
}

describe('<PatientBanner />', () => {
  it("clicking the button toggles displaying the patient's contact details", () => {
    renderPatientBanner();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: 'Show all details',
    });

    fireEvent.click(showContactDetailsBtn);

    const hideContactDetailsBtn = screen.getByRole('button', {
      name: 'Hide all details',
    });
    expect(hideContactDetailsBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();

    fireEvent.click(hideContactDetailsBtn);

    expect(showContactDetailsBtn).toBeInTheDocument();
  });

  it('should display the Active Visit tag when there is an active visit', () => {
    renderPatientBanner();

    expect(screen.queryByTitle('Active Visit')).toBeVisible();
  });

  it('should not display the Active Visit tag when there is not an active visit', () => {
    renderEmptyPatientBanner();

    expect(screen.queryByTitle('Active Visit')).toBeNull();
  });
});
