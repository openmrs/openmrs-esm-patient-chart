import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabSetPanel from './panel.component';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { mockBasePanel, mockObservations, mockConceptMeta, mockObservationsWithInterpretations } from '__mocks__';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type ObsRecord } from '../../types';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);

describe('LabSetPanel', () => {
  const mockSetActivePanel = jest.fn();
  const user = userEvent.setup();

  it('should render panel with basic information and observations', () => {
    render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
    expect(screen.getByText('01 — Jan — 2024 • 10:0')).toBeInTheDocument();

    expect(screen.getByText('Test name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Reference range')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const hemoglobinRow = rows.find((row) => within(row).queryByText('Hemoglobin'));
    const hematocritRow = rows.find((row) => within(row).queryByText('Hematocrit'));

    expect(within(hemoglobinRow).getByText('14 g/dL')).toBeInTheDocument();
    expect(within(hemoglobinRow).getByText('12-16 g/dL')).toBeInTheDocument();

    expect(within(hematocritRow).getByText('42 %')).toBeInTheDocument();
    expect(within(hematocritRow).getByText('35-45 %')).toBeInTheDocument();
  });

  it('should handle panel selection', async () => {
    render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    const buttonElement = screen.getByRole('button', {
      name: /Complete Blood Count/i,
    });

    await user.click(buttonElement);
    expect(mockSetActivePanel).toHaveBeenCalledWith(mockBasePanel);
  });

  it('should render panel without reference range when not provided', () => {
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
        panel={panelWithoutRange}
        observations={observationsWithoutRange}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByText('Test name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.queryByText('Reference range')).not.toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const hemoglobinRow = rows.find((row) => within(row).queryByText('Hemoglobin'));
    const hematocritRow = rows.find((row) => within(row).queryByText('Hematocrit'));

    expect(within(hemoglobinRow).getByText('14 g/dL')).toBeInTheDocument();
    expect(within(hematocritRow).getByText('42 %')).toBeInTheDocument();
  });

  it('should handle different interpretation styles', () => {
    render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservationsWithInterpretations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveClass('check');
    expect(rows[1]).toHaveClass('high', 'check');
    expect(rows[2]).toHaveClass('low', 'check');
  });

  it('should adjust table size based on layout', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);

    const { rerender } = render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--sm');

    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(false);

    rerender(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--md');
  });
});
