import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import ActiveVisitBannerTag from './active-visit-tag.component';
import { formatDatetime } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';

const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...(jest.requireActual('@openmrs/esm-patient-common-lib') as any),
  useVisitOrOfflineVisit: jest.fn(),
}));

describe('ActiveVisitBannerTag: ', () => {
  it('renders an active visit tag in the patient banner when an active visit is ongoing', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
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

  it('should not render active visit tag for deceased patients', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
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
