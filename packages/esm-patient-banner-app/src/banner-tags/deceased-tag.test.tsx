import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import DeceasedBannerTag from './deceased-tag.component';
import { useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import dayjs from 'dayjs';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
}));

describe('deceasedTag', () => {
  it('renders a deceased tag in the patient banner for patients who died', () => {
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit.visitData,
      error: null,
    });

    renderDeceasedBannerTag();
    
    expect(
      screen.getByRole('tooltip', {
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Deceased/i })).toBeInTheDocument();
  });
});

function renderDeceasedBannerTag() {
  render(<DeceasedBannerTag patientUuid={mockPatient.id} />);
}
