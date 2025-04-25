import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type ObsRecord } from '../../types';
import { mockBasePanel, mockObservations, mockConceptMeta, mockObservationsWithInterpretations } from '__mocks__';
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
        observations={mockObservations}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /complete blood count/i })).toBeInTheDocument();
    expect(screen.getByText('01 — Jan — 2024 • 10:00')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /test name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /reference range/i })).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/value/i)).toBeInTheDocument();
    expect(screen.getByText(/reference range/i)).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hemoglobin 14 g\/dL 12-16 g\/dL/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 42 % 35-45 %/i })).toBeInTheDocument();
  });

  it('clicking on the panel header sets the active panel', async () => {
    render(
      <LabSetPanel
        activePanel={null}
        observations={mockObservations}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    const buttonElement = screen.getByRole('button', {
      name: /complete blood count 01 — jan — 2024 • 10:00 test name value reference range hemoglobin 14 g\/dL 12-16 g\/dL hematocrit 42 % 35-45 %/i,
    });

    await user.click(buttonElement);
    expect(mockSetActivePanel).toHaveBeenCalledWith(mockBasePanel);
  });

  it('renders the panel without reference ranges when not provided', () => {
    const panelWithoutRange = {
      ...mockBasePanel,
      meta: {
        ...mockConceptMeta,
        range: undefined,
      },
    };

    const observationsWithoutRange: Array<ObsRecord> = [
      {
        ...mockBasePanel,
        id: '1',
        name: 'Hemoglobin',
        value: '14',
        interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
        meta: {
          ...mockConceptMeta,
          units: 'g/dL',
          range: undefined,
        },
      },
      {
        ...mockBasePanel,
        id: '2',
        name: 'Hematocrit',
        value: '42',
        interpretation: 'HIGH' as OBSERVATION_INTERPRETATION,
        meta: {
          ...mockConceptMeta,
          units: '%',
          range: undefined,
        },
      },
    ];

    render(
      <LabSetPanel
        activePanel={null}
        observations={observationsWithoutRange}
        panel={panelWithoutRange}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('columnheader', { name: /test name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /reference range/i })).not.toBeInTheDocument();

    expect(screen.getByRole('row', { name: /hemoglobin 14 g\/dL/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit/i })).toBeInTheDocument();
  });

  it('correctly highlights the interpretation of the observations', () => {
    render(
      <LabSetPanel
        activePanel={null}
        observations={mockObservationsWithInterpretations}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    const normalTest = screen.getByRole('row', { name: /normal test 14 g\/dL 12-16 g\/dL/i });
    const highTest = screen.getByRole('row', { name: /high test 42 g\/dL 12-16 g\/dL/i });
    const lowTest = screen.getByRole('row', { name: /low test 2 g\/dL 12-16 g\/dL/i });

    expect(normalTest).toHaveClass('check');
    expect(highTest).toHaveClass('high', 'check');
    expect(lowTest).toHaveClass('low', 'check');
  });

  it('adjusts the table size based on the layout', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);

    const { rerender } = render(
      <LabSetPanel
        activePanel={null}
        observations={mockObservations}
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
        observations={mockObservations}
        panel={mockBasePanel}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--md');
  });
});
