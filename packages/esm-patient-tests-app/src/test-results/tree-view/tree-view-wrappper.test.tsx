import React from 'react';
import { render, screen } from '@testing-library/react';
import TreeViewWrapper from './tree-view-wrapper.component';
import { renderExtension, useConfig, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../../config-schema';
import { mockGroupedResults, mockResults } from '__mocks__';
import { type FilterContextProps } from '../filter/filter-types';
import FilterContext from '../filter/filter-context';

const mockUsePatient = jest.mocked(usePatient);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseGetManyObstreeData = jest.fn();
const mockGetPatientUuidFromUrl = jest.fn(() => mockPatient.id);
const mockUseLayoutType = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
  usePatient: jest.fn(),
  parseDate: jest.fn(),
  formatDate: jest.fn(),
  useLayoutType: jest.fn(),
  TreeViewAltIcon: () => <svg data-testid="mock-treeview-icon" />,
  ArrowRightIcon: () => <svg data-testid="mock-arrow-right-icon" />,
}));

jest.mock('../panel-timeline/helpers', () => ({
  ...jest.requireActual('../panel-timeline/helpers'),
  parseTime: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib/src/store/patient-chart-store', () => {
  return {
    usePatientChartStore: () => ({ patientUuid: mockPatient.id }),
    getPatientUuidFromStore: () => mockGetPatientUuidFromUrl(),
  };
});

jest.mock('../grouped-timeline', () => ({
  ...jest.requireActual('../grouped-timeline'),
  useGetManyObstreeData: () => mockUseGetManyObstreeData(),
}));

mockUseConfig.mockReturnValue({
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
  labTestsWithOrderReasons: [],
});

mockUsePatient.mockReturnValue({
  patient: mockPatient,
  patientUuid: mockPatient.id,
  isLoading: false,
  error: null,
});

const mockProps = {
  patientUuid: 'test-patient-uuid',
  basePath: '/test-base-path',
  testUuid: 'test-uuid',
  expanded: false,
  type: 'default',
  view: 'individual-test' as const,
};

const mockFilterContext: FilterContextProps = {
  activeTests: ['Bloodwork-Chemistry', 'Bloodwork'],
  timelineData: mockGroupedResults.timelineData,
  parents: mockGroupedResults.parents,
  checkboxes: { Bloodwork: false, Chemistry: true },
  someChecked: true,
  lowestParents: mockGroupedResults['lowestParents'],
  totalResultsCount: 0,
  initialize: jest.fn(),
  toggleVal: jest.fn(),
  updateParent: jest.fn(),
  resetTree: jest.fn(),
  roots: mockResults,
  tests: {},
};

const renderTreeViewWrapperWithMockContext = (contextValue = mockFilterContext) => {
  render(
    <FilterContext.Provider value={contextValue}>
      <TreeViewWrapper {...mockProps} />
    </FilterContext.Provider>,
  );
};

describe('TreeViewWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLayoutType.mockReturnValue('small-desktop');
  });

  it('should render loading state when data is being fetched', () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: true,
      error: null,
    });

    render(<TreeViewWrapper {...mockProps} />);
    expect(screen.getByRole('heading', { name: /test results/i })).toBeInTheDocument();
    expect(screen.getByText(/there are no test results data to display for this patient/i)).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    const mockError = new Error('Test error');
    mockUseGetManyObstreeData.mockReturnValue({
      roots: [],
      isLoading: false,
      error: mockError,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByRole('heading', { name: /data load error/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /sorry, there was a problem displaying this information. you can try to reload this page, or contact the site administrator and quote the error code above./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders TreeView with data successfully', async () => {
    mockUseGetManyObstreeData.mockReturnValue({
      roots: mockResults,
      isLoading: false,
      error: null,
    });

    renderTreeViewWrapperWithMockContext();
    expect(screen.getAllByText('Complete blood count').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Haemoglobin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hematocrit').length).toBeGreaterThan(0);
  });
});
