import React from 'react';
import { render, screen } from '@testing-library/react';
import DeceasedPatientBannerTag from './deceased-patient-tag.component';
import { mockDeceasedPatient } from '../../../../__mocks__/mockDeceasedPatient';
import { mockPatient } from '../../../../__mocks__/patient.mock';

describe('DeceasedPatientTag', () => {
  it('does not render Deceased tag for patients who are still alive', () => {
    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<DeceasedPatientBannerTag patient={patient} patientUuid={mockDeceasedPatient.id} />);
    expect(screen.queryByRole('tooltip', { name: / 04-Apr-1972, 12:00 AM/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Deceased/ })).not.toBeInTheDocument();
  });

  it('renders a deceased tag in the patient banner for patients who died', () => {
    render(<DeceasedPatientBannerTag patient={mockDeceasedPatient} patientUuid={mockDeceasedPatient.id} />);

    expect(screen.getByRole('tooltip', { name: /Deceased 04-Apr-1972, 12:00 AM/i }));
  });
});
