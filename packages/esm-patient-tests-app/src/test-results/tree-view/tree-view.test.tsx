import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockResults } from '__mocks__';
import { type ConfigObject, configSchema } from '../../config-schema';
import { useGetManyObstreeData } from '../grouped-timeline';
import TreeView from './tree-view.component';
import { FilterProvider, type Roots } from '../filter/filter-context';

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
    <FilterProvider roots={mockResults as Roots} filteredRoots={mockResults as Roots} isLoading={false}>
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
      filteredRoots: [],
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
      filteredRoots: [],
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
      roots: mockResults,
      filteredRoots: mockResults,
      isLoading: false,
      error: null,
    });

    renderTreeViewWithMockContext();

    expect(screen.getAllByRole('table')).toHaveLength(3);
    expect(screen.getAllByText('Complete blood count').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Haemoglobin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hematocrit').length).toBeGreaterThan(0);
  });
});
