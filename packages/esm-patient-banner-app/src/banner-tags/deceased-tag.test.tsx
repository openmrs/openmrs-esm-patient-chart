import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import DeceasedBannerTag from './deceased-tag.component';

describe('deceasedTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    renderDeceasedBannerTag();
  });
});

function renderDeceasedBannerTag() {
  render(<DeceasedBannerTag patient={mockPatient} />);
}
