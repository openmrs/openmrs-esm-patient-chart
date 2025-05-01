import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit, mockVisit2, mockVisit3 } from '__mocks__';
import React from 'react';
import { useVisitContextStore } from './visit-context';
import { useInfiniteVisits } from '../visit.resource';
import VisitContextSwitcherModal from './visit-context-switcher.modal';

const mockUseSystemVisitSetting = jest.fn(useSystemVisitSetting).mockReturnValue({
  systemVisitEnabled: true,
  errorFetchingSystemVisitSetting: null,
  isLoadingSystemVisitSetting: false,
});

const mockUseVisitContextStore = jest.fn(useVisitContextStore).mockReturnValue({
  manuallySetVisitUuid: null,
  mutateVisitCallbacks: {},
  patientUuid: null,
  setVisitContext: jest.fn(),
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

jest.mock('./visit-context', () => ({
  useVisitContextStore: () => mockUseVisitContextStore(),
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
    // visit type
    expect(screen.getAllByText('Facility Visit')).toHaveLength(3);
  });
});

function renderVisitContextSwitcherModal() {
  render(<VisitContextSwitcherModal patientUuid="some-uuid" closeModal={jest.fn()} />);
}
