import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDatetime, parseDate, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit } from '__mocks__';
import { mockPatient } from 'tools';
import VisitTag from './visit-tag.extension';

const mockUseVisit = vi.mocked(useVisit);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  usePatientChartStore: vi.fn(),
  useSystemVisitSetting: vi.fn(),
}));

describe('VisitBannerTag', () => {
  beforeEach(() => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: null,
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    mockUseFeatureFlag.mockReturnValue(true);
  });

  it('renders an active visit tag when an active visit is ongoing', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    const visitMetadata =
      mockCurrentVisit.visitType.display +
      ' Started: ' +
      formatDatetime(parseDate(mockCurrentVisit.startDatetime), { mode: 'wide' });

    expect(
      screen.getByRole('tooltip', {
        name: new RegExp(visitMetadata.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*')),
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
      mutate: vi.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: '2002-04-04' };

    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });

  it('should not render the active visit tag when the visit in context is a past visit, even if an active visit exists', () => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: { ...mockCurrentVisit, stopDatetime: '2022-01-01T12:00:00.000+0000' },
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    expect(screen.queryByRole('button', { name: /Active Visit/i })).not.toBeInTheDocument();
  });

  it('renders the active visit tag when the visit in context is a past visit but the rde feature flag is off', () => {
    // Without RDE, the past visit tag never renders, so the active visit tag must not
    // hide either. A past visit can still land in the visit context without RDE, for
    // example after editing a past visit's details from the visit history.
    mockUseFeatureFlag.mockReturnValue(false);
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: { ...mockCurrentVisit, stopDatetime: '2022-01-01T12:00:00.000+0000' },
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    const patient = { ...mockPatient, deceasedDateTime: null };
    render(<VisitTag patientUuid={mockPatient.id} patient={patient} />);

    expect(screen.getByRole('button', { name: /Active Visit/i })).toBeInTheDocument();
  });
});
