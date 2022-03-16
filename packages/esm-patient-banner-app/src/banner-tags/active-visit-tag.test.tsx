import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import ActiveVisitBannerTag from './active-visit-tag.component';
import { formatDatetime, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
}));

describe('ActiveVisitBannerTag: ', () => {
  it('renders an active visit tag in the patient banner when an active visit is ongoing', () => {
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      mockCurrentVisit.visitType.name + ' Started: ' + formatDatetime(mockCurrentVisit.startDatetime, { mode: 'wide' });

    expect(
      screen.getByRole('tooltip', {
        name: visitMetadata,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Visit/i })).toBeInTheDocument();
  });

  it('should not render active visit tag if patient is dead', () => {
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      mockCurrentVisit.visitType.name + ' Started: ' + formatDatetime(mockCurrentVisit.startDatetime, { mode: 'wide' });

    expect(
      screen.queryByRole('tooltip', {
        name: visitMetadata,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });
});
