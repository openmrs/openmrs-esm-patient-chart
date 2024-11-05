import { render, screen } from '@testing-library/react';
import React from 'react';
import GroupedTimeline from './grouped-timeline.component';
import { mockGroupedResults } from '../../../../../__mocks__/grouped-results.mock';
import FilterContext from '../filter/filter-context';
import { type FilterContextProps } from '../filter/filter-types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('GroupedTimeline', () => {
  const mockFilterContext: FilterContextProps = {
    activeTests: ['Bloodwork-Chemistry', 'Bloodwork'],
    timelineData: mockGroupedResults.timelineData,
    parents: mockGroupedResults.parents,
    checkboxes: { Chemistry: true, Bloodwork: false },
    someChecked: false,
    lowestParents: mockGroupedResults['lowestParents'],
    totalResultsCount: 0,
    initialize: jest.fn(),
    toggleVal: jest.fn(),
    updateParent: jest.fn(),
    resetTree: jest.fn(),
    roots: [],
    tests: {},
  };

  const renderComponent = (contextValue = mockFilterContext) =>
    render(
      <FilterContext.Provider value={contextValue}>
        <GroupedTimeline patientUuid="some-test-uuid" />
      </FilterContext.Provider>,
    );

  it('renders EmptyState when rowData is empty', () => {
    renderComponent({
      ...mockFilterContext,
      timelineData: {
        ...mockFilterContext.timelineData,
        data: { ...mockFilterContext.timelineData.data, rowData: [] },
      },
    });

    expect(screen.getByText('dataTimelineText')).toBeInTheDocument();
    expect(screen.getByText('emptyStateText')).toBeInTheDocument();
  });

  it('renders timeline header and data when activeTests, timelineData, and loaded are present', () => {
    renderComponent();

    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();

    expect(screen.getByText('31 — May')).toBeInTheDocument();
    expect(screen.getByText('09 — Nov')).toBeInTheDocument();

    expect(screen.getByText('01:39 AM')).toBeInTheDocument();
    expect(screen.getByText('Serum chemistry panel')).toBeInTheDocument();
    expect(screen.getByText('Total bilirubin')).toBeInTheDocument();
    expect(screen.getByText('umol/L')).toBeInTheDocument();
    expect(screen.getByText('261.9')).toBeInTheDocument();
    expect(screen.getByText('21.5')).toBeInTheDocument();
    expect(screen.getByText('Serum glutamic-pyruvic transaminase')).toBeInTheDocument();
    expect(screen.getByText('0 – 35 IU/L')).toBeInTheDocument();
    expect(screen.getByText('3.8')).toBeInTheDocument();
    expect(screen.getByText('2.9')).toBeInTheDocument();
  });
});
