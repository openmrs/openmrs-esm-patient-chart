import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LabSetPanel from './panel.component';
import { useTranslation } from 'react-i18next';
import { formatDate, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { type ObsRecord } from '../../types';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  formatDate: jest.fn().mockReturnValue('January 1, 2024'),
  isDesktop: jest.fn().mockReturnValue(true),
  useLayoutType: jest.fn().mockReturnValue('desktop'),
}));

jest.mock('./helper', () => ({
  getClass: jest.fn((interpretation) => {
    switch (interpretation) {
      case 'HIGH':
        return 'high';
      case 'LOW':
        return 'low';
      case 'NORMAL':
      default:
        return '';
    }
  }),
}));

const mockConceptMeta = {
  display: '',
  hiNormal: 0,
  hiAbsolute: 0,
  hiCritical: 0,
  lowNormal: 0,
  lowAbsolute: 0,
  lowCritical: 0,
  units: 'g/dL',
  range: '12-16',
  getInterpretation: function (value: string): OBSERVATION_INTERPRETATION {
    return 'NORMAL';
  },
};

const mockBasePanel: ObsRecord = {
  resourceType: 'Observation',
  id: 'test-id',
  conceptUuid: 'test-uuid',
  category: [
    {
      coding: [
        {
          system: 'test-system',
          code: 'test-code',
          display: 'Laboratory',
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        code: 'test-code',
        display: 'Test Display',
      },
    ],
    text: 'Test Text',
  },
  effectiveDateTime: '2024-01-01T10:00:00Z',
  issued: '2024-01-01T10:00:00Z',
  name: 'Complete Blood Count',
  value: '120',
  interpretation: 'NORMAL',
  relatedObs: [],
  meta: mockConceptMeta,
  referenceRange: [],
};

const mockObservations: Array<ObsRecord> = [
  {
    ...mockBasePanel,
    id: '1',
    name: 'Hemoglobin',
    value: '14',
    interpretation: 'NORMAL',
    meta: {
      ...mockConceptMeta,
      units: 'g/dL',
      range: '12-16',
    },
  },
  {
    ...mockBasePanel,
    id: '2',
    name: 'Hematocrit',
    value: '42',
    interpretation: 'HIGH',
    meta: {
      ...mockConceptMeta,
      units: '%',
      range: '35-45',
    },
  },
];

describe('LabSetPanel', () => {
  const mockSetActivePanel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();

    expect(screen.getByText('testName')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
    expect(screen.getByText('referenceRange')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const hemoglobinRow = rows.find((row) => within(row).queryByText('Hemoglobin'));
    const hematocritRow = rows.find((row) => within(row).queryByText('Hematocrit'));

    expect(within(hemoglobinRow).getByText('14 g/dL')).toBeInTheDocument();
    expect(within(hemoglobinRow).getByText('12-16 g/dL')).toBeInTheDocument();

    expect(within(hematocritRow).getByText('42 %')).toBeInTheDocument();
    expect(within(hematocritRow).getByText('35-45 %')).toBeInTheDocument();
  });

  it('should handle panel selection', () => {
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
    fireEvent.click(buttonElement);
    expect(mockSetActivePanel).toHaveBeenCalledWith(mockBasePanel);
  });

  it('should render panel without reference range when not provided', () => {
    const panelWithoutRange: ObsRecord = {
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
        interpretation: 'NORMAL',
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
        interpretation: 'HIGH',
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

    expect(screen.getByText('testName')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
    expect(screen.queryByText('referenceRange')).not.toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const hemoglobinRow = rows.find((row) => within(row).queryByText('Hemoglobin'));
    const hematocritRow = rows.find((row) => within(row).queryByText('Hematocrit'));

    expect(within(hemoglobinRow).getByText('14 g/dL')).toBeInTheDocument();
    expect(within(hematocritRow).getByText('42 %')).toBeInTheDocument();
  });

  it('should handle different interpretation styles', () => {
    const observationsWithInterpretations: Array<ObsRecord> = [
      {
        ...mockBasePanel,
        id: '1',
        name: 'Normal Test',
        value: '14',
        interpretation: 'NORMAL',
      },
      {
        ...mockBasePanel,
        id: '2',
        name: 'High Test',
        value: '42',
        interpretation: 'HIGH',
      },
      {
        ...mockBasePanel,
        id: '3',
        name: 'Low Test',
        value: '2',
        interpretation: 'LOW',
      },
    ];

    render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={observationsWithInterpretations}
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
    (useLayoutType as unknown as jest.Mock).mockReturnValue('desktop');
    (isDesktop as unknown as jest.Mock).mockReturnValue(true);

    const { rerender } = render(
      <LabSetPanel
        panel={mockBasePanel}
        observations={mockObservations}
        activePanel={null}
        setActivePanel={mockSetActivePanel}
      />,
    );

    expect(screen.getByRole('table')).toHaveClass('cds--data-table--sm');

    (useLayoutType as unknown as jest.Mock).mockReturnValue('tablet');
    (isDesktop as unknown as jest.Mock).mockReturnValue(false);

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
