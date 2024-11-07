import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';
import { mockGroupedResults } from '__mocks__';
import { type FilterContextProps } from '../filter/filter-types';
import FilterContext from '../filter/filter-context';
import GroupedTimeline from './grouped-timeline.component';

const mockShowModal = jest.mocked(showModal);

describe('GroupedTimeline', () => {
  const mockFilterContext: FilterContextProps = {
    activeTests: ['Bloodwork-Chemistry', 'Bloodwork'],
    timelineData: mockGroupedResults.timelineData,
    parents: mockGroupedResults.parents,
    checkboxes: { Bloodwork: false, Chemistry: true },
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

  const renderGroupedTimeline = (contextValue = mockFilterContext) =>
    render(
      <FilterContext.Provider value={contextValue}>
        <GroupedTimeline patientUuid="some-test-uuid" />
      </FilterContext.Provider>,
    );

  it('renders an empty state when there are no results', () => {
    renderGroupedTimeline({
      ...mockFilterContext,
      timelineData: {
        ...mockFilterContext.timelineData,
        data: { ...mockFilterContext.timelineData.data, rowData: [] },
      },
    });

    expect(screen.getByRole('heading', { name: /data timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/there are no data to display for this patient/i)).toBeInTheDocument();
  });

  it('renders the grouped timeline view with the correct data', () => {
    renderGroupedTimeline();

    expect(screen.getByRole('heading', { name: /serum chemistry panel/i })).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('31 — May')).toBeInTheDocument();
    expect(screen.getByText('09 — Nov')).toBeInTheDocument();
    expect(screen.getByText('01:39 AM')).toBeInTheDocument();
    expect(screen.getByText('Total bilirubin')).toBeInTheDocument();
    expect(screen.getByText('umol/L')).toBeInTheDocument();
    expect(screen.getByText('261.9')).toBeInTheDocument();
    expect(screen.getByText('21.5')).toBeInTheDocument();
    expect(screen.getByText('Serum glutamic-pyruvic transaminase')).toBeInTheDocument();
    expect(screen.getByText('0 – 35 IU/L')).toBeInTheDocument();
    expect(screen.getByText('3.8')).toBeInTheDocument();
    expect(screen.getByText('2.9')).toBeInTheDocument();
  });

  it('correctly filters rows based on checkbox selection when someChecked is true', () => {
    renderGroupedTimeline({
      ...mockFilterContext,
      someChecked: true,
      checkboxes: { Chemistry: false, Bloodwork: true },
    });

    // TODO: Add assertions for showing checked items; would require updated mock data

    // Assert that Chemistry items are not shown
    expect(screen.queryByText('Serum glutamic-pyruvic transaminase')).not.toBeInTheDocument();
    expect(screen.queryByText('Serum glutamic-oxaloacetic transaminase')).not.toBeInTheDocument();
    expect(screen.queryByText('Alkaline phosphatase')).not.toBeInTheDocument();
    expect(screen.queryByText('Total bilirubin')).not.toBeInTheDocument();
  });

  it('correctly applies interpretation styling to results', () => {
    renderGroupedTimeline();

    const contextWithInterpretations = {
      ...mockFilterContext,
      timelineData: {
        ...mockFilterContext.timelineData,
        data: {
          ...mockFilterContext.timelineData.data,
          rowData: [
            {
              ...mockFilterContext.timelineData.data.rowData[0],
              entries: [
                { value: '100', interpretation: 'HIGH', obsDatetime: '2024-05-31T01:39:00.000Z' },
                { value: '50', interpretation: 'NORMAL', obsDatetime: '2024-05-31T01:39:00.000Z' },
                { value: '10', interpretation: 'LOW', obsDatetime: '2024-05-31T01:39:00.000Z' },
              ],
            },
          ],
        },
      },
    };

    renderGroupedTimeline(contextWithInterpretations as FilterContextProps);

    // eslint-disable-next-line testing-library/no-node-access
    const highCell = screen.getByText('100').closest('div');
    // eslint-disable-next-line testing-library/no-node-access
    const normalCell = screen.getByText('50').closest('div');

    // TODO: Add tests for low interpretation

    expect(highCell).toHaveClass('high');
    expect(normalCell).not.toHaveClass('high');
    expect(normalCell).not.toHaveClass('low');
  });

  it('launches a modal when a non-string result is clicked', async () => {
    const user = userEvent.setup();
    renderGroupedTimeline();

    const result = screen.getByText('Total bilirubin');
    await user.click(result);

    expect(mockShowModal).toHaveBeenCalled();
    expect(mockShowModal).toHaveBeenCalledWith('timeline-results-modal', {
      closeDeleteModal: expect.any(Function),
      patientUuid: 'some-test-uuid',
      testUuid: '655AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      title: 'Total bilirubin',
    });
  });
});
