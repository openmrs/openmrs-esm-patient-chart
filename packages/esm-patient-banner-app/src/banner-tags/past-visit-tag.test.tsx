import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDate, parseDate, useFeatureFlag } from '@openmrs/esm-framework';
import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { mockVisit } from '__mocks__';
import { mockPatient } from 'tools';
import PastVisitTag from './past-visit-tag.extension';

const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  usePatientChartStore: vi.fn(),
  useSystemVisitSetting: vi.fn(),
}));

describe('PastVisitTag', () => {
  beforeEach(() => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    mockUseFeatureFlag.mockReturnValue(true);
  });

  it('renders a past visit tag with the visit date when the visit in context has ended', () => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: mockVisit,
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    render(<PastVisitTag patientUuid={mockPatient.id} />);

    const formattedVisitDate = formatDate(parseDate(mockVisit.stopDatetime), { mode: 'standard', time: false });

    expect(
      screen.getByRole('button', { name: new RegExp(`Past visit.*${formattedVisitDate}`, 'i') }),
    ).toBeInTheDocument();
  });

  it('should not render the past visit tag when the visit in context is the active visit', () => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: { ...mockVisit, stopDatetime: null },
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    render(<PastVisitTag patientUuid={mockPatient.id} />);

    expect(screen.queryByRole('button', { name: /Past visit/i })).not.toBeInTheDocument();
  });

  it('should not render the past visit tag when the rde feature flag is disabled', () => {
    mockUseFeatureFlag.mockReturnValue(false);
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: mockVisit,
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    render(<PastVisitTag patientUuid={mockPatient.id} />);

    expect(screen.queryByRole('button', { name: /Past visit/i })).not.toBeInTheDocument();
  });
});
