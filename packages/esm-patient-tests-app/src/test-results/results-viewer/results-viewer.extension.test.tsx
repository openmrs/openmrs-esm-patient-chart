import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { mockPatient } from 'tools';
import { mockGroupedResults, mockResults } from '__mocks__';
import { type FilterContextProps } from '../filter/filter-types';
import FilterContext from '../filter/filter-context';
import TreeView from '../tree-view/tree-view.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseGetManyObstreeData = jest.fn();

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  resultsViewerConcepts: [
    {
      conceptUuid: '9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7',
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

jest.mock('../grouped-timeline', () => ({
  ...jest.requireActual('../grouped-timeline'),
  useGetManyObstreeData: () => mockUseGetManyObstreeData(),
}));

const testProps = {
  patientUuid: mockPatient.id,
  patient: mockPatient,
  basePath: '/spa/patient/some-uuid/chart/Results',
  testUuid: 'test-uuid',
  expanded: false,
  type: 'default',
  view: 'individual-test' as const,
  isLoading: false,
  error: null,
};

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
});

const mockFilterContext: FilterContextProps = {
  activeTests: ['Bloodwork-Chemistry', 'Bloodwork'],
  timelineData: mockGroupedResults.timelineData,
  tableData: null,
  trendlineData: null,
  parents: mockGroupedResults.parents,
  checkboxes: { Bloodwork: false, Chemistry: true },
  someChecked: true,
  lowestParents: mockGroupedResults['lowestParents'],
  totalResultsCount: 0,
  isLoading: false,
  initialize: jest.fn(),
  toggleVal: jest.fn(),
  updateParent: jest.fn(),
  resetTree: jest.fn(),
  roots: mockResults,
  tests: {},
  filteredResultsCount: 0,
};

global.IntersectionObserver = jest.fn(function (callback, options) {
  this.observe = jest.fn();
  this.unobserve = jest.fn();
  this.disconnect = jest.fn();
  this.trigger = (entries) => callback(entries, this);
  this.options = options;
}) as any;

const renderTreeViewWithMockContext = (contextValue = mockFilterContext) => {
  render(
    <FilterContext.Provider value={contextValue}>
      <TreeView {...testProps} />
    </FilterContext.Provider>,
  );
};
describe('ResultsViewer', () => {
  it('should return an empty state when there is no data', async () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: false,
      error: null,
    });
    render(<TreeView {...testProps} />);

    const testResultsText = screen.getByRole('heading', { name: /test results/i });
    expect(testResultsText).toBeInTheDocument();
    expect(screen.getByText(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no test results data to display for this patient/i)).toBeInTheDocument();
  });

  it('should return an error state when there is an error', async () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: false,
      error: new Error('An error occurred'),
    });
    render(<TreeView {...testProps} />);
    const testResultsText = screen.getByRole('heading', { name: /data load error/i });
    expect(testResultsText).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./i,
      ),
    ).toBeInTheDocument();
  });

  it('should render the Tree wrapper component component', async () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: mockResults,
      isLoading: false,
      error: null,
    });
    renderTreeViewWithMockContext();
    expect(screen.getAllByText(/complete blood count/i)).toHaveLength(1);
    expect(screen.getAllByText(/hematocrit/i)).toHaveLength(1);
    expect(screen.getAllByText(/hemoglobin/i)).toHaveLength(2);
    const mainLabel = screen.getByLabelText(/Lipid panel/i);
    expect(mainLabel).toBeInTheDocument();

    const checkboxes = [
      'Total cholesterol (mmol/L)',
      'High-density lipoprotein cholesterol measurement (mmol/L)',
      'Low-density lipoprotein cholesterol (mmol/L)',
      'Very low density lipoprotein measurement (mmol/L)',
      'Triglycerides (mmol/L)',
    ];

    checkboxes.forEach((label) => {
      const checkboxes = screen.getAllByLabelText(label);
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });
    });

    // Look for a panel that actually has children with data and is rendered as an accordion
    // "Complete blood count" has children with data (like Platelets), so it should be rendered as an accordion
    const panelButtons = screen.getAllByRole('button', { name: /Complete blood count/i });
    expect(panelButtons).toHaveLength(2); // There should be 2 buttons with this name
    const panelButton = panelButtons[0]; // Use the first one
    expect(panelButton).toBeInTheDocument();

    await userEvent.click(panelButton);
    const completeBloodCountTexts = screen.getAllByText(/Complete blood count/i);
    expect(completeBloodCountTexts.length).toBeGreaterThan(0);
    expect(completeBloodCountTexts[0]).toBeVisible();
  });
});
