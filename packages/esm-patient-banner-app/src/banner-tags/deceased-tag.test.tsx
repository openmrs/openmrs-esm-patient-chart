import React from 'react';
import { render } from '@testing-library/react';
import DeceasedBannerTag from './deceased-tag.component';
import { mockDeceasedPatient } from '../../../../__mocks__/mockDeceasedPatient';

describe('deceasedTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    renderDeceasedBannerTag();
  });
});

function renderDeceasedBannerTag() {
  render(<DeceasedBannerTag patient={mockDeceasedPatient} />);
}
