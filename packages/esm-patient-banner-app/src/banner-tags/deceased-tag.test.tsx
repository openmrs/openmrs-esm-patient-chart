import React from 'react';
import { render, screen } from '@testing-library/react';
import DeceasedBannerTag from './deceased-tag.component';
import { mockDeceasedPatient } from '../../../../__mocks__/mockDeceasedPatient';

describe('deceasedTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    renderDeceasedBannerTag();
    expect(screen.getByRole('button', { name: /Deceased/i })).toBeInTheDocument();

  });

  it('doesnot render Deceased tag for patients who are still alive', () => {
    alivePatient();
    expect(screen.getByRole('button', { name: /Deceased/i })).not.toBeInTheDocument();
  });
});

const renderDeceasedBannerTag = () => {
  render(<DeceasedBannerTag patient={mockDeceasedPatient} />);
};
const alivePatient = () => {
  render(<DeceasedBannerTag patient={mockPatient} />);
};
