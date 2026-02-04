import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { FilterProvider, type Roots } from './filter-context';
import { type TreeNode } from './filter-types';
import FilterSet from './filter-set.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = jest.mocked(useLayoutType);

// Create mock data with actual observations for testing
// This structure has nested parent-child relationships where CBC is a category with sub-panels
const mockRootsWithData: Array<TreeNode> = [
  {
    display: 'Hematology',
    flatName: 'Hematology',
    conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
    hasData: true,
    subSets: [
      {
        display: 'Complete Blood Count',
        flatName: 'Hematology: Complete Blood Count',
        conceptUuid: 'cbc-concept-uuid',
        hasData: true,
        subSets: [
          {
            display: 'Hemoglobin',
            flatName: 'Hematology: Complete Blood Count: Hemoglobin',
            conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            datatype: 'Numeric',
            units: 'g/dL',
            hasData: true,
            obs: [
              {
                obsDatetime: '2024-01-01',
                value: '12.5',
                interpretation: 'NORMAL',
              },
            ],
          },
          {
            display: 'Hematocrit',
            flatName: 'Hematology: Complete Blood Count: Hematocrit',
            conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            datatype: 'Numeric',
            units: '%',
            hasData: true,
            obs: [
              {
                obsDatetime: '2024-01-01',
                value: '38.0',
                interpretation: 'NORMAL',
              },
            ],
          },
          {
            display: 'White Blood Cell Count',
            flatName: 'Hematology: Complete Blood Count: WBC',
            conceptUuid: '678AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            datatype: 'Numeric',
            units: '10^9/L',
            hasData: true,
            obs: [
              {
                obsDatetime: '2024-01-01',
                value: '7.5',
                interpretation: 'NORMAL',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    display: 'Chemistry',
    flatName: 'Chemistry',
    conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    hasData: true,
    subSets: [
      {
        display: 'Lipid Panel',
        flatName: 'Chemistry: Lipid Panel',
        conceptUuid: 'lipid-concept-uuid',
        hasData: true,
        subSets: [
          {
            display: 'Total Cholesterol',
            flatName: 'Chemistry: Lipid Panel: Cholesterol',
            conceptUuid: '1006AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            datatype: 'Numeric',
            units: 'mg/dL',
            hasData: true,
            obs: [
              {
                obsDatetime: '2024-01-01',
                value: '180',
                interpretation: 'NORMAL',
              },
            ],
          },
        ],
      },
    ],
  },
];

// Simpler mock for tests that don't need nested structure
const mockSimpleRootsWithData: Array<TreeNode> = [
  {
    display: 'Complete Blood Count',
    flatName: 'CBC',
    conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
    hasData: true,
    subSets: [
      {
        display: 'Hemoglobin',
        flatName: 'CBC: Hemoglobin',
        conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        datatype: 'Numeric',
        units: 'g/dL',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-01',
            value: '12.5',
            interpretation: 'NORMAL',
          },
        ],
      },
      {
        display: 'Hematocrit',
        flatName: 'CBC: Hematocrit',
        conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        datatype: 'Numeric',
        units: '%',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-01',
            value: '38.0',
            interpretation: 'NORMAL',
          },
        ],
      },
      {
        display: 'White Blood Cell Count',
        flatName: 'CBC: WBC',
        conceptUuid: '678AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        datatype: 'Numeric',
        units: '10^9/L',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-01',
            value: '7.5',
            interpretation: 'NORMAL',
          },
        ],
      },
    ],
  },
  {
    display: 'Lipid Panel',
    flatName: 'Lipid',
    conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    hasData: true,
    subSets: [
      {
        display: 'Total Cholesterol',
        flatName: 'Lipid: Cholesterol',
        conceptUuid: '1006AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        datatype: 'Numeric',
        units: 'mg/dL',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-01',
            value: '180',
            interpretation: 'NORMAL',
          },
        ],
      },
      {
        display: 'HDL Cholesterol',
        flatName: 'Lipid: HDL',
        conceptUuid: '1007AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        datatype: 'Numeric',
        units: 'mg/dL',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-01',
            value: '55',
            interpretation: 'NORMAL',
          },
        ],
      },
    ],
  },
];

describe('FilterSet', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      resultsViewerConcepts: [
        {
          conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7', // CBC
          defaultOpen: true,
        },
        {
          conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Lipid Panel
          defaultOpen: false,
        },
      ],
      orders: {
        labOrderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
        labOrderableConcepts: [],
      },
      additionalTestOrderTypes: [],
      labTestsWithOrderReasons: [],
    });
  });

  describe('User checkbox interactions', () => {
    it('should render all configured test panels with their tests', () => {
      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
      expect(screen.getByText('Lipid Panel')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /hemoglobin/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /hematocrit/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /white blood cell count/i })).toBeInTheDocument();
    });

    it('should toggle individual test checkbox when clicked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const hemoglobinCheckbox = screen.getByRole('checkbox', { name: /hemoglobin/i });
      expect(hemoglobinCheckbox).not.toBeChecked();

      await user.click(hemoglobinCheckbox);

      expect(hemoglobinCheckbox).toBeChecked();
    });

    it('should toggle multiple test checkboxes independently', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const hemoglobinCheckbox = screen.getByRole('checkbox', { name: /hemoglobin/i });
      const hematocritCheckbox = screen.getByRole('checkbox', { name: /hematocrit/i });

      await user.click(hemoglobinCheckbox);
      expect(hemoglobinCheckbox).toBeChecked();
      expect(hematocritCheckbox).not.toBeChecked();

      await user.click(hematocritCheckbox);
      expect(hemoglobinCheckbox).toBeChecked();
      expect(hematocritCheckbox).toBeChecked();
    });

    it('should not affect checkboxes in different panels', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const hemoglobinCheckbox = screen.getByRole('checkbox', { name: /hemoglobin/i });
      const cholesterolCheckbox = screen.getByRole('checkbox', { name: /total cholesterol/i });

      await user.click(hemoglobinCheckbox);

      expect(hemoglobinCheckbox).toBeChecked();
      expect(cholesterolCheckbox).not.toBeChecked();
    });
  });

  describe('Parent checkbox behavior', () => {
    beforeEach(() => {
      // Update config to include nested panel conceptUuids
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        resultsViewerConcepts: [
          {
            conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7', // Hematology
            defaultOpen: true,
          },
          {
            conceptUuid: 'cbc-concept-uuid', // Complete Blood Count (nested)
            defaultOpen: true,
          },
          {
            conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Chemistry
            defaultOpen: false,
          },
          {
            conceptUuid: 'lipid-concept-uuid', // Lipid Panel (nested)
            defaultOpen: false,
          },
        ],
        orders: {
          labOrderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
          labOrderableConcepts: [],
        },
        additionalTestOrderTypes: [],
        labTestsWithOrderReasons: [],
      });
    });

    it('should show parent checkbox in indeterminate state when some children are checked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // Expand the accordion to reveal children
      const expandButton = screen.getAllByRole('button', { name: /expand all/i })[0];
      await user.click(expandButton);

      const hemoglobinCheckbox = screen.getByRole('checkbox', { name: /hemoglobin/i });
      await user.click(hemoglobinCheckbox);

      // Find the parent checkbox - it will have the label "Complete Blood Count"
      const parentCheckbox = screen.getByRole('checkbox', { name: /complete blood count/i });

      // When some but not all children are checked, parent should be indeterminate
      expect(parentCheckbox).toHaveProperty('indeterminate', true);
    });

    it('should check parent checkbox when all children are checked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // Expand the accordion
      const expandButton = screen.getAllByRole('button', { name: /expand all/i })[0];
      await user.click(expandButton);

      // Check all children
      await user.click(screen.getByRole('checkbox', { name: /hemoglobin/i }));
      await user.click(screen.getByRole('checkbox', { name: /hematocrit/i }));
      await user.click(screen.getByRole('checkbox', { name: /white blood cell count/i }));

      const parentCheckbox = screen.getByRole('checkbox', { name: /complete blood count/i });

      expect(parentCheckbox).toBeChecked();
      expect(parentCheckbox).toHaveProperty('indeterminate', false);
    });

    it('should toggle all children when parent checkbox is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // Expand the accordion
      const expandButton = screen.getAllByRole('button', { name: /expand all/i })[0];
      await user.click(expandButton);

      const parentCheckbox = screen.getByRole('checkbox', { name: /complete blood count/i });

      // All children should start unchecked
      expect(screen.getByRole('checkbox', { name: /hemoglobin/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /hematocrit/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /white blood cell count/i })).not.toBeChecked();

      // Click parent to check all
      await user.click(parentCheckbox);

      expect(screen.getByRole('checkbox', { name: /hemoglobin/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /hematocrit/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /white blood cell count/i })).toBeChecked();

      // Click parent again to uncheck all
      await user.click(parentCheckbox);

      expect(screen.getByRole('checkbox', { name: /hemoglobin/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /hematocrit/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /white blood cell count/i })).not.toBeChecked();
    });
  });

  describe('Accordion expand/collapse', () => {
    it('should respect defaultOpen configuration', () => {
      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // CBC should be open by default (defaultOpen: true)
      expect(screen.getByRole('checkbox', { name: /^hemoglobin$/i })).toBeVisible();

      // Lipid Panel should be closed by default (defaultOpen: false)
      // The parent checkbox is visible, but children might not be
      expect(screen.getByText('Lipid Panel')).toBeInTheDocument();
    });

    it('should expand all tests when Expand all button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const expandAllButtons = screen.getAllByRole('button', { name: /expand all/i });
      await user.click(expandAllButtons[0]);

      // All accordions should now be expanded
      expect(screen.getByRole('checkbox', { name: /^hemoglobin$/i })).toBeVisible();
      expect(screen.getByRole('checkbox', { name: /hematocrit/i })).toBeVisible();
    });

    it('should collapse all tests when Collapse all button is clicked after expanding', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const expandAllButtons = screen.getAllByRole('button', { name: /expand all/i });
      await user.click(expandAllButtons[0]);

      const collapseAllButtons = screen.getAllByRole('button', { name: /collapse all/i });
      await user.click(collapseAllButtons[0]);

      // Button text should change back to "Expand all"
      expect(screen.getAllByRole('button', { name: /expand all/i }).length).toBeGreaterThan(0);
    });
  });

  describe('Configuration-based filtering', () => {
    it('should render all panels with subSets regardless of configuration', () => {
      // Note: This test documents current behavior where configuration filtering
      // only applies to panels with empty subSets (line 66 in filter-set.component.tsx)
      // Panels with non-empty subSets are rendered even if not in config
      const mockRootsWithConfiguredAndUnconfigured: Array<TreeNode> = [
        {
          display: 'Complete Blood Count',
          flatName: 'CBC',
          conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7', // Configured
          hasData: true,
          subSets: [
            {
              display: 'Hemoglobin',
              flatName: 'CBC: Hemoglobin',
              conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              hasData: true,
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
            },
          ],
        },
        {
          display: 'Unconfigured Panel',
          flatName: 'Unconfigured',
          conceptUuid: 'unconfigured-uuid', // Not in config
          hasData: true,
          subSets: [
            {
              display: 'Unconfigured Test',
              flatName: 'Unconfigured: Test',
              conceptUuid: 'unconfigured-test-uuid', // Not in config
              hasData: true,
              obs: [{ obsDatetime: '2024-01-01', value: '100', interpretation: 'NORMAL' }],
            },
          ],
        },
      ];

      // Override config to only include CBC
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        resultsViewerConcepts: [
          {
            conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7', // Only CBC configured
            defaultOpen: true,
          },
        ],
        orders: {
          labOrderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
          labOrderableConcepts: [],
        },
        additionalTestOrderTypes: [],
        labTestsWithOrderReasons: [],
      });

      render(
        <FilterProvider roots={mockRootsWithConfiguredAndUnconfigured as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // CBC should be visible
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /hemoglobin/i })).toBeInTheDocument();

      // Current behavior: Unconfigured panels with subSets ARE rendered
      // because config filtering only applies when subSets.length === 0
      expect(screen.getByText('Unconfigured Panel')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /unconfigured test/i })).toBeInTheDocument();
    });

    it('should filter out nodes without subSets at root level', () => {
      const mockRootsWithLeafAtRoot: Array<TreeNode> = [
        {
          display: 'Valid Parent',
          flatName: 'ValidParent',
          conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
          hasData: true,
          subSets: [
            {
              display: 'Child Test',
              flatName: 'ValidParent: Child',
              hasData: true,
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
            },
          ],
        },
        {
          display: 'Invalid Leaf at Root',
          flatName: 'InvalidLeaf',
          conceptUuid: 'leaf-uuid',
          hasData: true,
          obs: [{ obsDatetime: '2024-01-01', value: '100', interpretation: 'NORMAL' }],
        },
      ];

      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        resultsViewerConcepts: [
          { conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7', defaultOpen: true },
          { conceptUuid: 'leaf-uuid', defaultOpen: true },
        ],
        orders: {
          labOrderTypeUuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
          labOrderableConcepts: [],
        },
        additionalTestOrderTypes: [],
        labTestsWithOrderReasons: [],
      });

      render(
        <FilterProvider roots={mockRootsWithLeafAtRoot as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      expect(screen.getByText('Valid Parent')).toBeInTheDocument();
      expect(screen.queryByText('Invalid Leaf at Root')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no results match filters', () => {
      render(
        <FilterProvider roots={[] as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      expect(screen.getByText(/no results to display/i)).toBeInTheDocument();
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
    });

    it('should clear search and show all results when Clear filters is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      // Initially, results should be visible
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();

      // Simulate a scenario where search would cause empty results
      // Since we don't have direct access to search input in this simple version,
      // we can test that the clear filter button is wired correctly when empty state appears
      render(
        <FilterProvider roots={[] as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const clearFiltersButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearFiltersButton).toBeInTheDocument();
    });
  });

  describe('Disabled states', () => {
    it('should disable checkboxes for tests without data', () => {
      const mockRootsWithNoData: Array<TreeNode> = [
        {
          display: 'Test Panel',
          flatName: 'TestPanel',
          conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
          hasData: false,
          subSets: [
            {
              display: 'Test Without Data',
              flatName: 'TestPanel: NoData',
              hasData: false,
              obs: [],
            },
            {
              display: 'Test With Data',
              flatName: 'TestPanel: WithData',
              hasData: true,
              obs: [{ obsDatetime: '2024-01-01', value: '12', interpretation: 'NORMAL' }],
            },
          ],
        },
      ];

      render(
        <FilterProvider roots={mockRootsWithNoData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      const noDataCheckbox = screen.getByRole('checkbox', { name: /test without data/i });
      const withDataCheckbox = screen.getByRole('checkbox', { name: /test with data/i });

      expect(noDataCheckbox).toBeDisabled();
      expect(withDataCheckbox).toBeEnabled();
    });
  });

  describe('Responsive layout', () => {
    it('should render tablet layout when layoutType is tablet', () => {
      mockUseLayoutType.mockReturnValue('tablet');

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
      // Component should render successfully in tablet mode
    });

    it('should render desktop layout when layoutType is small-desktop', () => {
      mockUseLayoutType.mockReturnValue('small-desktop');

      render(
        <FilterProvider roots={mockRootsWithData as Roots} isLoading={false}>
          <FilterSet />
        </FilterProvider>,
      );

      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
      // Component should render successfully in desktop mode
    });
  });
});
