import React from 'react';
import { render, screen } from '@testing-library/react';
import TreeViewWrapper from './tree-view-wrapper.component';
import { useGetManyObstreeData } from '../grouped-timeline';
import { useConfig } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  useLayoutType: jest.fn(),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
}));

// Mock @openmrs/esm-patient-common-lib
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  EmptyState: jest.fn(({ headerTitle, displayText }) => (
    <div data-testid="mock-empty-state">
      <div>{headerTitle}</div>
      <div>{displayText}</div>
    </div>
  )),
  ErrorState: jest.fn(({ headerTitle }) => (
    <div data-testid="mock-error-state">
      <div>{headerTitle}</div>
    </div>
  )),
}));

jest.mock('../grouped-timeline', () => ({
  useGetManyObstreeData: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('./tree-view.component', () => {
  return jest.fn().mockImplementation((props) => {
    return (
      <div data-testid="mock-tree-view">
        TreeView Component
        <div data-testid="tree-view-props">{JSON.stringify(props)}</div>
      </div>
    );
  });
});

const mockConfig = {
  resultsViewerConcepts: [{ conceptUuid: 'concept-1' }, { conceptUuid: 'concept-2' }],
};

const mockProps = {
  patientUuid: 'test-patient-uuid',
  basePath: '/test-base-path',
  testUuid: 'test-uuid',
  expanded: false,
  type: 'default',
  view: 'individual-test' as const,
};

describe('TreeViewWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should render loading state when data is being fetched', () => {
    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: [],
      isLoading: true,
      error: null,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('testResults_title')).toBeInTheDocument();
    expect(screen.getByText('testResultsData')).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    const mockError = new Error('Test error');
    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: [],
      isLoading: false,
      error: mockError,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-error-state')).toBeInTheDocument();
    expect(screen.getByText('dataLoadError')).toBeInTheDocument();
  });

  it('should render TreeView when data is loaded successfully', () => {
    const mockRoots = [
      { id: 'root1', name: 'Root 1' },
      { id: 'root2', name: 'Root 2' },
    ];

    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: mockRoots,
      isLoading: false,
      error: null,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-tree-view')).toBeInTheDocument();
    const propsElement = screen.getByTestId('tree-view-props');
    const passedProps = JSON.parse(propsElement.textContent || '{}');
    expect(passedProps.isLoading).toBe(false);
  });

  it('should render EmptyState when no roots are present', () => {
    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: [],
      isLoading: false,
      error: null,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('testResults_title')).toBeInTheDocument();
    expect(screen.getByText('testResultsData')).toBeInTheDocument();
  });

  it('should handle missing config gracefully', () => {
    (useConfig as jest.Mock).mockReturnValue({});
    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: [],
      isLoading: false,
      error: null,
    });

    render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('testResults_title')).toBeInTheDocument();
  });

  it('should pass correct props to TreeView', () => {
    const mockRoots = [{ id: 'root1', name: 'Root 1' }];
    (useGetManyObstreeData as jest.Mock).mockReturnValue({
      roots: mockRoots,
      isLoading: false,
      error: null,
    });

    const { rerender } = render(<TreeViewWrapper {...mockProps} />);

    expect(screen.getByTestId('mock-tree-view')).toBeInTheDocument();
    let propsElement = screen.getByTestId('tree-view-props');
    let passedProps = JSON.parse(propsElement.textContent || '{}');
    expect(passedProps.expanded).toBe(false);
    expect(passedProps.type).toBe('default');

    // Test with different props
    rerender(<TreeViewWrapper {...mockProps} expanded={true} type="trendline" view="over-time" />);

    propsElement = screen.getByTestId('tree-view-props');
    passedProps = JSON.parse(propsElement.textContent || '{}');
    expect(passedProps.expanded).toBe(true);
    expect(passedProps.type).toBe('trendline');
    expect(passedProps.view).toBe('over-time');
  });
});
