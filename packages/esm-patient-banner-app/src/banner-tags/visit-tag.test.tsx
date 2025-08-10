import React from 'react';
import { render, screen } from '@testing-library/react';
import { formatDatetime, parseDate, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import { mockPatient } from 'tools';
import VisitTag from './visit-tag.extension';

const mockUseVisit = jest.mocked(useVisit);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useVisitOrOfflineVisit: jest.fn(),
}));

describe('VisitBannerTag', () => {
  it('renders an active visit tag when an active visit is ongoing', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      mockCurrentVisit.visitType.display +
      ' Started: ' +
      formatDatetime(parseDate(mockCurrentVisit.startDatetime), { mode: 'wide' });

    expect(
      screen.getByRole('tooltip', {
        name: visitMetadata,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Visit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retrospective Entry/i })).not.toBeInTheDocument();
  });

  it('should not render active visit tag for deceased patients', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };

    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });
});
