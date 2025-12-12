import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockResults } from '__mocks__';
import { type ConfigObject, configSchema } from '../../config-schema';
import { useGetManyObstreeData } from '../grouped-timeline';
import { FilterProvider, type Roots } from '../filter/filter-context';
import { type ObsTreeNode } from '../grouped-timeline/useObstreeData';
import TreeView from './tree-view.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseGetManyObstreeData = jest.mocked(useGetManyObstreeData);

jest.mock('../grouped-timeline', () => ({
  ...jest.requireActual('../grouped-timeline'),
  useGetManyObstreeData: jest.fn(),
}));

const mockProps = {
  patientUuid: mockPatient.id,
  expanded: false,
  view: 'individual-test' as const,
};

const renderTreeViewWithMockContext = () => {
  render(
    <FilterProvider roots={mockResults as Roots} isLoading={false}>
      <TreeView {...mockProps} />
    </FilterProvider>,
  );
};

describe('TreeView', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      resultsViewerConcepts: [
        {
          conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
          defaultOpen: true,
        },
        {
          conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          defaultOpen: true,
        },
        {
          conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          defaultOpen: false,
        },
      ],
      orders: {
        labOrderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
        labOrderableConcepts: ['1748a953-d12e-4be1-914c-f6b096c6cdef'],
      },
      additionalTestOrderTypes: [],
      labTestsWithOrderReasons: [],
    });
  });

  it('renders an empty state view when there is no data', () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: false,
      error: null,
    });

    render(<TreeView {...mockProps} />);

    expect(screen.getByRole('heading', { name: /test results/i })).toBeInTheDocument();
    expect(screen.getByText(/there are no test results data to display for this patient/i)).toBeInTheDocument();
  });

  it('renders an error state when there is an error', () => {
    const mockError = new Error('Test error');
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: false,
      error: mockError,
    });

    render(<TreeView {...mockProps} />);

    expect(screen.getByRole('heading', { name: /data load error/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /sorry, there was a problem displaying this information. you can try to reload this page, or contact the site administrator and quote the error code above./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the tree view when test data is successfully fetched', async () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: mockResults as unknown as Array<ObsTreeNode>,
      isLoading: false,
      error: null,
    });

    renderTreeViewWithMockContext();

    expect(screen.getAllByRole('table')).toHaveLength(3);
    expect(screen.getAllByText('Complete blood count').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Haemoglobin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hematocrit').length).toBeGreaterThan(0);
  });

  describe('Reset button - Tablet overlay', () => {
    beforeEach(() => {
      mockUseLayoutType.mockReturnValue('tablet');
      mockUseGetManyObstreeData.mockReturnValue({
        roots: mockResults as unknown as Array<ObsTreeNode>,
        isLoading: false,
        error: null,
      });
    });

    it('should show reset tree button in tablet overlay when tree is opened', async () => {
      const user = userEvent.setup();

      renderTreeViewWithMockContext();

      // Open the tree overlay by clicking the tree button
      const treeButton = screen.getByRole('button', { name: /show tree/i });
      await user.click(treeButton);

      // Reset tree button should be visible in the overlay
      const resetButton = screen.getByRole('button', { name: /reset tree/i });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toBeEnabled();
    });

    it('should show both reset and view buttons in overlay', async () => {
      const user = userEvent.setup();

      renderTreeViewWithMockContext();

      // Open the tree overlay
      const treeButton = screen.getByRole('button', { name: /show tree/i });
      await user.click(treeButton);

      // Both buttons should be visible and enabled
      const resetButton = screen.getByRole('button', { name: /reset tree/i });
      const viewButton = screen.getByRole('button', { name: /view.*results/i });

      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toBeEnabled();
      expect(viewButton).toBeInTheDocument();
      expect(viewButton).toBeEnabled();
    });

    it('should reset filters when reset tree button is clicked', async () => {
      const user = userEvent.setup();

      renderTreeViewWithMockContext();

      // Open the tree overlay
      const treeButton = screen.getByRole('button', { name: /show tree/i });
      await user.click(treeButton);

      // Find an enabled checkbox (one with hasData: true in mock data)
      // Mock data has "Platelets" with data
      const plateletsCheckboxes = screen.getAllByRole('checkbox', { name: /platelets/i });
      // Find the first enabled one
      const plateletsCheckbox = plateletsCheckboxes.find((cb) => !cb.hasAttribute('disabled'));

      expect(plateletsCheckbox).toBeDefined();
      await user.click(plateletsCheckbox);
      expect(plateletsCheckbox).toBeChecked();

      // Click reset tree button
      const resetButton = screen.getByRole('button', { name: /reset tree/i });
      await user.click(resetButton);

      // Checkbox should be unchecked
      expect(plateletsCheckbox).not.toBeChecked();
    });

    it('should show filtered results count in view button', async () => {
      const user = userEvent.setup();

      renderTreeViewWithMockContext();

      // Open the tree overlay
      const treeButton = screen.getByRole('button', { name: /show tree/i });
      await user.click(treeButton);

      // Initially should show total count
      const viewButton = screen.getByRole('button', { name: /view.*results/i });
      expect(viewButton).toBeInTheDocument();

      // Check a filter - find an enabled checkbox
      const plateletsCheckboxes = screen.getAllByRole('checkbox', { name: /platelets/i });
      const plateletsCheckbox = plateletsCheckboxes.find((cb) => !cb.hasAttribute('disabled'));
      await user.click(plateletsCheckbox);

      // View button should update with filtered count
      expect(screen.getByRole('button', { name: /view.*results/i })).toBeInTheDocument();
    });

    it('should close overlay when view results button is clicked', async () => {
      const user = userEvent.setup();

      renderTreeViewWithMockContext();

      // Open the tree overlay
      const treeButton = screen.getByRole('button', { name: /show tree/i });
      await user.click(treeButton);

      // Reset tree button should be visible in the overlay
      const resetButton = screen.getByRole('button', { name: /reset tree/i });
      expect(resetButton).toBeInTheDocument();

      // Click view results button
      const viewButton = screen.getByRole('button', { name: /view.*results/i });
      await user.click(viewButton);

      // Overlay should be closed (reset button no longer visible)
      expect(screen.queryByRole('button', { name: /reset tree/i })).not.toBeInTheDocument();
    });
  });
});
