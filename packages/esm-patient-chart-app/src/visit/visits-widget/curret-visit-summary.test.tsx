import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentVisitSummary from './current-visit-summary.component';
import { useVisits } from './visit.resource';

const mockUseVisits = useVisits as jest.Mock;

jest.mock('./visit.resource', () => ({
  useVisits: jest.fn(),
}));

describe('CurrentVisitSummary', () => {
  it('should display loading state', () => {
    mockUseVisits.mockReturnValueOnce({
      visits: [],
      isLoading: true,
      isValidating: false,
      isError: null,
    });

    render(<CurrentVisitSummary patientUuid="some-uuid" />);
    expect(screen.getByText('Loading current visit...')).toBeInTheDocument();
  });

  it('should display empty state when there is no active visit', () => {
    mockUseVisits.mockReturnValueOnce({
      visits: [],
      isLoading: false,
      isValidating: false,
      isError: null,
    });

    render(<CurrentVisitSummary patientUuid="some-uuid" />);
    expect(screen.getByText('currentVisit')).toBeInTheDocument();
    expect(screen.getByText('There are no active visit to display for this patient')).toBeInTheDocument();
  });
});
