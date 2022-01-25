import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import ActiveVisitBannerTag from './active-visit-tag.component';
import { useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import dayjs from 'dayjs';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
}));

describe('ActiveVisitBannerTag: ', () => {
  it('renders an active visit tag in the patient banner when an active visit is ongoing', () => {
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit.visitData,
      error: null,
    });

    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={mockPatient} />);

    const visitMetadata =
      mockCurrentVisit.visitData.visitType.name +
      ' Started: ' +
      dayjs(mockCurrentVisit.visitData.startDatetime).format('DD - MMM - YYYY @ HH:mm');

    expect(
      screen.getByRole('tooltip', {
        name: visitMetadata,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Visit/i })).toBeInTheDocument();
  });
});
