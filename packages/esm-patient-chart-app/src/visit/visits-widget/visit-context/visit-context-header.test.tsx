import { useVisitContextStore } from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit } from '__mocks__';
import React from 'react';
import VisitContextHeader from './visit-context-header.component';

const mockUseSystemVisitSetting = jest.fn(useSystemVisitSetting).mockReturnValue({
  systemVisitEnabled: true,
  errorFetchingSystemVisitSetting: null,
  isLoadingSystemVisitSetting: false,
});

jest.mocked(useVisitContextStore).mockReturnValue({
  manuallySetVisitUuid: null,
  mutateVisitCallbacks: {},
  patientUuid: null,
  setVisitContext: jest.fn(),
  mutateVisit: jest.fn(),
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    useSystemVisitSetting: () => mockUseSystemVisitSetting(),
    usePatientChartStore: () => ({
      visits: {
        currentVisit: mockCurrentVisit,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
        activeVisit: null,
        currentVisitIsRetrospective: false,
        isLoading: false,
      },
    }),
  };
});

describe('VisitContextHeader', () => {
  it('should not show header if system does not support visits', () => {
    mockUseSystemVisitSetting.mockReturnValueOnce({
      systemVisitEnabled: false,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    render(<VisitContextHeader patientUuid="some-uuid" />);
    expect(screen.queryByText('Adding to')).not.toBeInTheDocument();
  });

  it('should show the current visit', () => {
    render(<VisitContextHeader patientUuid="some-uuid" />);
    expect(screen.getByText(/Adding to/i)).toBeInTheDocument();
    expect(screen.getByText(mockCurrentVisit.visitType.display)).toBeInTheDocument();
  });
});
