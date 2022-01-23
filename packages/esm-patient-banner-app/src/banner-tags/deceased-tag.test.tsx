import React from 'react';
import { render, screen } from '@testing-library/react';
import DeceasedBannerTag from './deceased-tag.component';
import { mockDeceasedPatient } from '../../../../__mocks__/mockDeceasedPatient';
import { mockPatient } from '../../../../__mocks__/patient.mock';

describe('deceasedTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    render(<DeceasedBannerTag patient={mockDeceasedPatient} />);

    expect(screen.getByRole('button', { name: /Deceased/ })).toBeInTheDocument();
  });

  it('doesnot render Deceased tag for patients who are still alive', () => {
    render(<DeceasedBannerTag patient={mockPatient} />);

    expect(screen.queryByRole('button', { name: /Deceased/ })).not.toBeInTheDocument();
  });
});
