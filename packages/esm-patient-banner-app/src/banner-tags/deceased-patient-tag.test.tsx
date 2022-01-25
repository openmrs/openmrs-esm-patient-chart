import React from 'react';
import { render, screen } from '@testing-library/react';
import DeceasedPatientBannerTag from './deceased-patient-tag.component';
import { mockDeceasedPatient } from '../../../../__mocks__/mockDeceasedPatient';
import { mockPatient } from '../../../../__mocks__/patient.mock';

describe('DeceasedPatientTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    render(<DeceasedPatientBannerTag patient={mockDeceasedPatient} />);

    expect(screen.getByRole('button', { name: /Deceased/ })).toBeInTheDocument();
  });

  it('doesnot render Deceased tag for patients who are still alive', () => {
    render(<DeceasedPatientBannerTag patient={mockPatient} />);

    expect(screen.queryByRole('button', { name: /Deceased/ })).not.toBeInTheDocument();
  });
});
