import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { mockResults } from '__mocks__';
import { FilterProvider, type Roots } from '../filter/filter-context';
import IndividualResultsTableTablet from './individual-results-table-tablet.component';

const mockIsDesktop = jest.mocked(isDesktop);
const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('./usePanelData');

describe('PanelView', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);
  });

  it('renders a loading state when data is loading', () => {
    render(
      <FilterProvider roots={mockResults as Roots} isLoading={true}>
        <IndividualResultsTableTablet expanded={false} patientUuid="test-patient" />
      </FilterProvider>,
    );

    const skeletonTables = screen.getAllByTestId('cds--data-table-container');
    expect(skeletonTables.length).toBeGreaterThan(0);
  });

  it('renders an empty state when there are no panels to display', () => {
    render(
      <FilterProvider roots={[]} isLoading={false}>
        <IndividualResultsTableTablet expanded={false} patientUuid="test-patient" />
      </FilterProvider>,
    );

    expect(screen.getByText(/no panels found/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no panels to display for this patient/i)).toBeInTheDocument();
  });

  it('renders the panel view when data is loaded', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);

    render(
      <FilterProvider roots={mockResults as Roots} isLoading={false}>
        <IndividualResultsTableTablet expanded={false} patientUuid="test-patient" />
      </FilterProvider>,
    );

    expect(screen.getByRole('heading', { name: /complete blood count/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hiv viral load/i })).toBeInTheDocument();
    // This observation belongs to two panels
    expect(screen.getAllByRole('row', { name: /platelets 56/i })).toHaveLength(2);
    expect(screen.getByRole('row', { name: /hiv viral load 600/i })).toBeInTheDocument();
  });

  it('filters the panel view when searching for a test', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');
    render(
      <FilterProvider roots={mockResults as Roots} isLoading={false}>
        <IndividualResultsTableTablet expanded={false} patientUuid="test-patient" />
      </FilterProvider>,
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /complete blood count/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hematology/i })).toBeInTheDocument();
    // This observation belongs to both panels
    expect(screen.getAllByRole('row', { name: /platelets 56/i })).toHaveLength(2);
    expect(screen.getByRole('row', { name: /hiv viral load 600/i })).toBeInTheDocument();

    await user.click(searchButton);

    const searchBox = screen.getByPlaceholderText(/search by test name/i);
    expect(searchBox).toBeInTheDocument();

    await user.type(searchBox, 'hiv viral load');
    await user.keyboard('{Enter}');

    expect(screen.queryByRole('row', { name: /platelets 56/i })).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv viral load 600/i })).toBeInTheDocument();
  });

  it('selecting a test opens the timeline view on tablet', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(true);

    render(
      <FilterProvider roots={mockResults as Roots} isLoading={false}>
        <IndividualResultsTableTablet expanded={false} patientUuid="test-patient" />
      </FilterProvider>,
    );

    const hivViralLoadCell = screen.getByRole('cell', { name: /hiv viral load/i });
    await user.click(hivViralLoadCell);

    expect(screen.getByRole('banner', { name: /hiv viral load/i })).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
    await user.click(backButton);

    expect(backButton).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv viral load 600/i })).toBeInTheDocument();
  });
});
