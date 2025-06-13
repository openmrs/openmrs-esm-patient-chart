import React from 'react';
import { render, screen } from '@testing-library/react';
import { useVisitContextStore } from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit, mockVisit2, mockVisit3 } from '__mocks__';
import { useInfiniteVisits } from '../visit.resource';
import VisitContextSwitcherModal from './visit-context-switcher.modal';

const mockUseSystemVisitSetting = jest.fn(useSystemVisitSetting).mockReturnValue({
  errorFetchingSystemVisitSetting: null,
  isLoadingSystemVisitSetting: false,
  systemVisitEnabled: true,
});

jest.mocked(useVisitContextStore).mockReturnValue({
  manuallySetVisitUuid: null,
  mutateVisitCallbacks: {},
  patientUuid: null,
  setVisitContext: jest.fn(),
  mutateVisit: jest.fn(),
});

const mockUseInfiniteVisits = jest.fn(useInfiniteVisits).mockReturnValue({
  visits: [mockCurrentVisit, mockVisit2, mockVisit3],
  error: null,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  totalCount: 3,
  hasMore: false,
  loadMore: jest.fn(),
  nextUri: '',
});

jest.mock('@openmrs/esm-patient-common-lib/src/useSystemVisitSetting', () => ({
  useSystemVisitSetting: () => mockUseSystemVisitSetting(),
}));

jest.mock('../visit.resource', () => ({
  useInfiniteVisits: () => mockUseInfiniteVisits('some-uuid'),
}));

describe('VisitContextSwitcherModal', () => {
  it('should display a list of past visits', () => {
    mockUseSystemVisitSetting.mockReturnValueOnce({
      systemVisitEnabled: false,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
    renderVisitContextSwitcherModal();
    // location
    expect(screen.getAllByText('Registration Desk')).toHaveLength(3);
    // visit type - only check the visitType div elements
    expect(screen.getAllByText('Facility Visit', { selector: '.visitType' })).toHaveLength(3);
  });
});

function renderVisitContextSwitcherModal() {
  render(<VisitContextSwitcherModal patientUuid="some-uuid" closeModal={jest.fn()} />);
}
