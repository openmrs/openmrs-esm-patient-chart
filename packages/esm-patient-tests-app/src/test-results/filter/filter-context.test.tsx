import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider, FilterContext } from './filter-context';
import { type TreeNode } from './filter-types';

// Test component to access context values
const TestConsumer = () => {
  const {
    activeTests,
    someChecked,
    totalResultsCount,
    filteredResultsCount,
    timelineData,
    tableData,
    toggleVal,
    updateParent,
    resetTree,
  } = useContext(FilterContext);

  return (
    <div>
      <div data-testid="active-tests">{activeTests.join(',')}</div>
      <div data-testid="some-checked">{someChecked.toString()}</div>
      <div data-testid="total-count">{totalResultsCount}</div>
      <div data-testid="filtered-count">{filteredResultsCount}</div>
      <div data-testid="timeline-loaded">{timelineData?.loaded.toString()}</div>
      <div data-testid="timeline-rows">{timelineData?.data?.rowData?.length || 0}</div>
      <div data-testid="table-groups">{tableData?.length || 0}</div>
      <button onClick={() => toggleVal('Test1')}>Toggle Test1</button>
      <button onClick={() => updateParent('Panel1')}>Toggle Panel1</button>
      <button onClick={resetTree}>Reset</button>
    </div>
  );
};

const mockRoots: Array<TreeNode> = [
  {
    display: 'Complete Blood Count',
    flatName: 'CBC',
    hasData: true,
    subSets: [
      {
        display: 'Hemoglobin',
        flatName: 'CBC: Hemoglobin',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-15T10:00:00.000Z',
            value: '12.5',
            interpretation: 'NORMAL',
          },
          {
            obsDatetime: '2024-01-10T10:00:00.000Z',
            value: '12.0',
            interpretation: 'NORMAL',
          },
        ],
        subSets: [],
      },
      {
        display: 'White Blood Cell Count',
        flatName: 'CBC: WBC',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-15T10:00:00.000Z',
            value: '7.5',
            interpretation: 'NORMAL',
          },
        ],
        subSets: [],
      },
    ],
  },
  {
    display: 'Lipid Panel',
    flatName: 'Lipid',
    hasData: true,
    subSets: [
      {
        display: 'Total Cholesterol',
        flatName: 'Lipid: Cholesterol',
        hasData: true,
        obs: [
          {
            obsDatetime: '2024-01-20T10:00:00.000Z',
            value: '180',
            interpretation: 'NORMAL',
          },
        ],
        subSets: [],
      },
    ],
  },
];

describe('FilterContext', () => {
  describe('Initialization', () => {
    it('should initialize with roots data', async () => {
      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loaded')).toHaveTextContent('true');
      });
    });

    it('should compute totalResultsCount from all observations', async () => {
      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        // 2 hemoglobin + 1 WBC + 1 cholesterol = 4 total
        expect(screen.getByTestId('total-count')).toHaveTextContent('4');
      });
    });

    it('should show filteredResultsCount equal to totalResultsCount when no filters applied', async () => {
      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('4');
      });
      expect(screen.getByTestId('some-checked')).toHaveTextContent('false');
    });
  });

  describe('Active tests tracking', () => {
    it('should track activeTests when checkboxes are toggled', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loaded')).toHaveTextContent('true');
      });

      const toggleButton = screen.getByRole('button', { name: /toggle test1/i });
      await user.click(toggleButton);

      expect(screen.getByTestId('active-tests')).toHaveTextContent('Test1');
      expect(screen.getByTestId('some-checked')).toHaveTextContent('true');
    });

    it('should update someChecked when tests are selected', async () => {
      const user = userEvent.setup();

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('some-checked')).toHaveTextContent('false');

      await user.click(screen.getByRole('button', { name: /toggle test1/i }));

      expect(screen.getByTestId('some-checked')).toHaveTextContent('true');
    });
  });

  describe('Filtered results count', () => {
    it('should update filteredResultsCount when filters are applied', async () => {
      const user = userEvent.setup();

      const FilterTestComponent = () => {
        const { toggleVal, filteredResultsCount, totalResultsCount, someChecked } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="total-count">{totalResultsCount}</div>
            <div data-testid="filtered-count">{filteredResultsCount}</div>
            <div data-testid="some-checked">{someChecked.toString()}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle Hemoglobin</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <FilterTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-count')).toHaveTextContent('4');
      });

      expect(screen.getByTestId('filtered-count')).toHaveTextContent('4');
      expect(screen.getByTestId('some-checked')).toHaveTextContent('false');

      await user.click(screen.getByRole('button', { name: /toggle hemoglobin/i }));
      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
      });
      expect(screen.getByTestId('some-checked')).toHaveTextContent('true');
    });
  });

  describe('Timeline data', () => {
    it('should generate timeline data with all tests when no filters applied', async () => {
      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loaded')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('timeline-rows')).toHaveTextContent('3');
    });

    it('should filter timeline data when tests are selected', async () => {
      const user = userEvent.setup();

      const TimelineTestComponent = () => {
        const { toggleVal, timelineData } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="timeline-rows">{timelineData?.data?.rowData?.length || 0}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle Hemoglobin</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TimelineTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-rows')).toHaveTextContent('3');
      });

      await user.click(screen.getByRole('button', { name: /toggle hemoglobin/i }));

      await waitFor(() => {
        expect(screen.getByTestId('timeline-rows')).toHaveTextContent('1');
      });
    });

    it('should sort timeline observations by date descending', async () => {
      const TimelineDetailsComponent = () => {
        const { timelineData } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="timeline-loaded">{timelineData?.loaded.toString()}</div>
            {timelineData?.data?.parsedTime?.sortedTimes && (
              <div data-testid="first-time">{timelineData.data.parsedTime.sortedTimes[0]}</div>
            )}
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TimelineDetailsComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loaded')).toHaveTextContent('true');
      });

      const firstTime = screen.getByTestId('first-time').textContent;
      expect(firstTime).toContain('2024-01-20');
    });
  });

  describe('Table data', () => {
    it('should generate grouped table data', async () => {
      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        const tableGroups = screen.getByTestId('table-groups');
        expect(parseInt(tableGroups.textContent || '0')).toBeGreaterThan(0);
      });
    });

    it('should group observations by panel and date', async () => {
      const TableTestComponent = () => {
        const { tableData } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="table-groups">{tableData?.length || 0}</div>
            {tableData?.map((group, index) => (
              <div key={index} data-testid={`group-${index}`}>
                {group.key} - {group.date} - {group.entries.length}
              </div>
            ))}
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <TableTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('table-groups')).not.toHaveTextContent('0');
      });

      const groups = screen.getAllByTestId(/^group-/);
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('should toggle individual test via toggleVal', async () => {
      const user = userEvent.setup();

      const ActionTestComponent = () => {
        const { toggleVal, checkboxes } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="checkbox-state">{checkboxes['CBC: Hemoglobin']?.toString() || 'false'}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <ActionTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('checkbox-state')).toBeInTheDocument();
      });

      expect(screen.getByTestId('checkbox-state')).toHaveTextContent('false');

      await user.click(screen.getByRole('button', { name: /toggle/i }));

      await waitFor(() => {
        expect(screen.getByTestId('checkbox-state')).toHaveTextContent('true');
      });
    });

    it('should reset all filters via resetTree', async () => {
      const user = userEvent.setup();

      const ResetTestComponent = () => {
        const { toggleVal, resetTree, checkboxes, someChecked } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="some-checked">{someChecked.toString()}</div>
            <div data-testid="hemoglobin-state">{checkboxes['CBC: Hemoglobin']?.toString() || 'false'}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle Hemoglobin</button>
            <button onClick={resetTree}>Reset</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <ResetTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('some-checked')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /toggle hemoglobin/i }));

      await waitFor(() => {
        expect(screen.getByTestId('some-checked')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('hemoglobin-state')).toHaveTextContent('true');

      await user.click(screen.getByRole('button', { name: /reset/i }));

      await waitFor(() => {
        expect(screen.getByTestId('some-checked')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('hemoglobin-state')).toHaveTextContent('false');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty roots gracefully', () => {
      render(
        <FilterProvider roots={[]} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('0');
    });

    it('should handle tests with no observations', async () => {
      const emptyRoots: Array<TreeNode> = [
        {
          display: 'Empty Panel',
          flatName: 'Empty',
          hasData: false,
          subSets: [
            {
              display: 'Empty Test',
              flatName: 'Empty: Test',
              hasData: false,
              obs: [],
              subSets: [],
            },
          ],
        },
      ];

      render(
        <FilterProvider roots={emptyRoots} isLoading={false}>
          <TestConsumer />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-count')).toHaveTextContent('0');
      });
    });

    it('should reflect isLoading prop', () => {
      const LoadingTestComponent = () => {
        const { isLoading } = useContext(FilterContext);
        return <div data-testid="is-loading">{isLoading.toString()}</div>;
      };

      const { rerender } = render(
        <FilterProvider roots={mockRoots} isLoading={true}>
          <LoadingTestComponent />
        </FilterProvider>,
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      rerender(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <LoadingTestComponent />
        </FilterProvider>,
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  describe('Computed values reactivity', () => {
    it('should recompute timelineData when checkboxes change', async () => {
      const user = userEvent.setup();

      const ReactivityTestComponent = () => {
        const { toggleVal, timelineData } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="row-count">{timelineData?.data?.rowData?.length || 0}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle Hemoglobin</button>
            <button onClick={() => toggleVal('CBC: WBC')}>Toggle WBC</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <ReactivityTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('row-count')).toHaveTextContent('3');
      });

      await user.click(screen.getByRole('button', { name: /toggle hemoglobin/i }));

      await waitFor(() => {
        expect(screen.getByTestId('row-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByRole('button', { name: /toggle wbc/i }));

      await waitFor(() => {
        expect(screen.getByTestId('row-count')).toHaveTextContent('2');
      });
    });

    it('should recompute filteredResultsCount when selections change', async () => {
      const user = userEvent.setup();

      const CountTestComponent = () => {
        const { toggleVal, filteredResultsCount } = useContext(FilterContext);

        return (
          <div>
            <div data-testid="filtered-count">{filteredResultsCount}</div>
            <button onClick={() => toggleVal('CBC: Hemoglobin')}>Toggle Hemoglobin</button>
            <button onClick={() => toggleVal('Lipid: Cholesterol')}>Toggle Cholesterol</button>
          </div>
        );
      };

      render(
        <FilterProvider roots={mockRoots} isLoading={false}>
          <CountTestComponent />
        </FilterProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('4');
      });

      await user.click(screen.getByRole('button', { name: /toggle hemoglobin/i }));

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
      });

      await user.click(screen.getByRole('button', { name: /toggle cholesterol/i }));

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('3');
      });
    });
  });
});
