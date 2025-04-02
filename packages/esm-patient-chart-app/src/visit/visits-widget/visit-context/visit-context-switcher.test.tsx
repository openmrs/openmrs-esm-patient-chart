import { useVisit } from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit, mockVisit2, mockVisit3, visitOverviewDetailMockData } from '__mocks__';
import React from 'react';
import { useVisitContextStore } from './visit-context';
import { useInfiniteVisits, usePaginatedVisits } from '../visit.resource';
import VisitContextSwitcherModal from './visit-context-switcher.modal';

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

const mockUsePaginatedVisits = jest.fn(usePaginatedVisits).mockReturnValue({
  data: [mockCurrentVisit, mockVisit2, mockVisit3],
  error: null,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  totalPages: 1,
  totalCount: 1,
  currentPage: 1,
  currentPageSize: { current: 3 },
  paginated: false,
  showNextButton: false,
  showPreviousButton: false,
  goTo: jest.fn(),
  goToNext: jest.fn(),
  goToPrevious: jest.fn(),
});

jest.mock('@openmrs/esm-patient-common-lib/src/useSystemVisitSetting', () => ({
  useSystemVisitSetting: () => mockUseSystemVisitSetting(),
}));

jest.mock('./visit-context', () => ({
  useVisitContextStore: () => mockUseVisitContextStore(),
}));

jest.mock('../visit.resource', () => ({
  usePaginatedVisits: () => mockUsePaginatedVisits('some-uuid', 20),
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
