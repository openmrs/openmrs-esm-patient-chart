import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit, mockVisit2, mockVisit3 } from '__mocks__';
import { useInfiniteVisits } from '../visit.resource';
import VisitContextSwitcherModal from './visit-context-switcher.modal';

const mockUseInfiniteVisits = jest.fn(useInfiniteVisits);

jest.mock('../visit.resource', () => ({
  useInfiniteVisits: () => mockUseInfiniteVisits('some-uuid'),
}));

const mockSetVisitContext = jest.fn();
const mockUseSystemVisitSetting = jest.fn(useSystemVisitSetting);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useSystemVisitSetting: jest.fn(),
  usePatientChartStore: jest.fn(() => ({
    visitContext: null,
    setVisitContext: mockSetVisitContext,
  })),
}));

describe('VisitContextSwitcherModal', () => {
  beforeEach(() => {
    mockUseInfiniteVisits.mockReturnValue({
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
    mockUseSystemVisitSetting.mockReturnValue({
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
      systemVisitEnabled: true,
    });
  });

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

  it('should call setVisitContext when continue button is clicked with selected visit', async () => {
    const user = userEvent.setup();

    renderVisitContextSwitcherModal();

    // Select a visit by clicking on the first visit card
    const firstVisitRadio = screen.getAllByRole('radio', { name: /Facility Visit/ })[0];
    await user.click(firstVisitRadio);

    // Click the continue button
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    // Verify setVisitContext was called with the selected visit
    expect(mockSetVisitContext).toHaveBeenCalledWith(mockCurrentVisit, expect.any(Function));
  });
});

function renderVisitContextSwitcherModal() {
  render(<VisitContextSwitcherModal patientUuid="some-uuid" closeModal={jest.fn()} />);
}
