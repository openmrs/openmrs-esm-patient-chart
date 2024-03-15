import React from 'react';
import { render, screen } from '@testing-library/react';
import { formatDatetime } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit } from '__mocks__';
import { mockPatient } from 'tools';
import VisitTag from './visit-tag.extension';

const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...(jest.requireActual('@openmrs/esm-patient-common-lib') as any),
  useVisitOrOfflineVisit: jest.fn(),
}));

describe('VisitBannerTag: ', () => {
  it('renders an active visit tag when an active visit is ongoing', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      mockCurrentVisit.visitType.display +
      ' Started: ' +
      formatDatetime(mockCurrentVisit.startDatetime, { mode: 'wide' });

    expect(
      screen.getByRole('tooltip', {
        name: visitMetadata,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Visit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retrospective Entry/i })).not.toBeInTheDocument();
  });

  it('should not render active visit tag for deceased patients', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);
    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });
});
