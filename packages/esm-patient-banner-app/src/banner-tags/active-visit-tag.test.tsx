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
  it('renders an active visit tag when an active visit is ongoing', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      isRetrospective: false,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);

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

  it('renders a retrospective visit tag when a retrospective visit is ongoing', () => {
    const currentVisit = { ...mockCurrentVisit, stopDatetime: new Date('2021-03-16T10:05:00.000+0000') };
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit,
      isRetrospective: true,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      currentVisit.visitType.display +
      ' Start date: ' +
      formatDatetime(currentVisit.startDatetime, { mode: 'wide' }) +
      ' End date: ' +
      formatDatetime(currentVisit.stopDatetime, { mode: 'wide' });

    expect(
      screen.getByRole('tooltip', {
        name: visitMetadata,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retrospective Entry/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });

  it('should not render active visit tag for deceased patients', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      isRetrospective: false,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);
    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });

  it('renders retrospective visit tag for deceased patients', () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: { mockCurrentVisit, stopDatetime: new Date('2021-03-16T10:05:00.000+0000') },
      isRetrospective: true,
      error: null,
    });
    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };
    render(<ActiveVisitBannerTag patientUuid={mockPatient.id} patient={patient} />);
    expect(screen.getByRole('button', { name: /Retrospective Entry/i })).toBeInTheDocument();
  });
});
