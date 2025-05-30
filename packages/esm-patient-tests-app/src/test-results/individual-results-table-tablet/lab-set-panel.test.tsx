import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { mockBasePanel } from '__mocks__';
import LabSetPanel from './lab-set-panel.component';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);

describe('LabSetPanel', () => {
  const user = userEvent.setup();
  const mockSetActivePanel = jest.fn();

  it('renders the panel header, columns, and observations when provided', () => {
    render(
      <LabSetPanel
        activePanel={null}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hematology/i })).toBeInTheDocument();
    expect(screen.getByText('01 — Jan — 2024 • 10:00')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /test name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /reference range/i })).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/value/i)).toBeInTheDocument();
    expect(screen.getByText(/reference range/i)).toBeInTheDocument();
    const cbcRow = screen.getByRole('row', { name: /complete blood count 120 g\/dL 100-150 g\/dL/i });
    const hemoglobinRow = screen.getByRole('row', { name: /hemoglobin 8 g\/dL 12-16 g\/dL/i });
    const hematocritRow = screen.getByRole('row', { name: /hematocrit 50 % 35-45 %/i });

    expect(cbcRow).toBeInTheDocument();
    expect(hemoglobinRow).toBeInTheDocument();
    expect(hematocritRow).toBeInTheDocument();

    expect(cbcRow).toHaveClass('check');
    expect(hemoglobinRow).toHaveClass('low', 'check');
    expect(hematocritRow).toHaveClass('high', 'check');
  });

  it('clicking on the panel header sets the active panel', async () => {
    render(
      <LabSetPanel
        activePanel={null}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    const buttonElement = screen.getByRole('button', {
      name: /hematology/i,
    });

    await user.click(buttonElement);
    expect(mockSetActivePanel).toHaveBeenCalledWith(mockBasePanel);
  });

  it('renders the panel without reference ranges when not provided', () => {
    const panelWithoutRange = mockBasePanel;
    panelWithoutRange.entries.forEach((entry) => {
      entry.range = undefined;
    });

    render(
      <LabSetPanel
        activePanel={null}
        panel={panelWithoutRange}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('columnheader', { name: /test name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /reference range/i })).not.toBeInTheDocument();

    expect(screen.getByRole('row', { name: /hemoglobin 8 g\/dL/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 50 %/i })).toBeInTheDocument();
  });

  it('adjusts the table size based on the layout', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);

    const { rerender } = render(
      <LabSetPanel
        activePanel={null}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--sm');

    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(false);

    rerender(
      <LabSetPanel
        activePanel={null}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--md');
  });
});
