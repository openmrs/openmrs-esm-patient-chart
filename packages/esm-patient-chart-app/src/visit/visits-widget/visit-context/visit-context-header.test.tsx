import { useVisit } from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit } from '__mocks__';
import React from 'react';
import { useVisitContextStore } from './visit-context';
import VisitContextHeader from './visit-context-header.component';

const mockUseSystemVisitSetting = jest.fn(useSystemVisitSetting).mockReturnValue({
  systemVisitEnabled: true,
  errorFetchingSystemVisitSetting: null,
  isLoadingSystemVisitSetting: false,
});

const mockUseVisitContextStore = jest.fn(useVisitContextStore).mockReturnValue({
  manuallySetVisitUuid: null,
  patientUuid: null,
  setVisitContext: jest.fn(),
});

jest.mocked(useVisit).mockReturnValue({
  currentVisit: mockCurrentVisit,
  error: null,
  mutate: jest.fn(),
  isValidating: false,
  activeVisit: null,
  currentVisitIsRetrospective: false,
  isLoading: false,
});

jest.mock('@openmrs/esm-patient-common-lib/src/useSystemVisitSetting', () => ({
  useSystemVisitSetting: () => mockUseSystemVisitSetting(),
}));

jest.mock('./visit-context', () => ({
  useVisitContextStore: () => mockUseVisitContextStore(),
}));

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
