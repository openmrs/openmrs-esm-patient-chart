import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit } from '__mocks__';
import React from 'react';
import VisitContextHeader from './visit-context-header.extension';
import { mockPatient } from 'tools';

const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  usePatientChartStore: vi.fn(),
  useSystemVisitSetting: vi.fn(),
}));

describe('VisitContextHeader', () => {
  beforeEach(() => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
  });

  it('should not show header if system does not support visits', () => {
    mockUseSystemVisitSetting.mockReturnValueOnce({
      systemVisitEnabled: false,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: null,
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    render(<VisitContextHeader patientUuid="some-uuid" />);
    expect(screen.queryByText('Adding to')).not.toBeInTheDocument();
  });

  it('should show the current visit', () => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: mockCurrentVisit,
      mutateVisitContext: null,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    });

    render(<VisitContextHeader patientUuid={mockPatient.id} />);
    expect(screen.getByText(/Adding to/i)).toBeInTheDocument();
    expect(screen.getByText(mockCurrentVisit.visitType.display)).toBeInTheDocument();
  });
});
