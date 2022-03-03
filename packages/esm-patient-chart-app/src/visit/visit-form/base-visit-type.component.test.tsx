import React from 'react';
import { usePagination, useVisitTypes } from '@openmrs/esm-framework';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockVisitTypes } from '../../../../../__mocks__/visits.mock';
import BaseVisitType from './base-visit-type.component';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const mockUsePagination = usePagination as jest.Mock;
const mockUseVisitTypes = useVisitTypes as jest.Mock;
const mockHandleChange = jest.fn();
const mockGoToPage = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  usePagination: jest.fn(),
  useVisitTypes: jest.fn(),
}));

describe('VisitTypeOverview', () => {
  const renderVisitTypeOverview = () => {
    mockUsePagination.mockReturnValue({
      results: mockVisitTypes.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
    render(<BaseVisitType onChange={mockHandleChange} visitTypes={mockVisitTypes} patientUuid="some-patient-uuid" />);
  };

  it('should be able to search for a visit type', () => {
    renderVisitTypeOverview();

    const hivVisit = screen.getByRole('radio', { name: /HIV Return Visit/i });
    const outpatientVisit = screen.getByRole('radio', { name: /Outpatient Visit/i });

    expect(outpatientVisit).toBeInTheDocument();
    expect(hivVisit).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox');
    userEvent.type(searchInput, 'HIV');

    expect(outpatientVisit).toBeEmptyDOMElement();
    expect(hivVisit).toBeInTheDocument();
  });
});
