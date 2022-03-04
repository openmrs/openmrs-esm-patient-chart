import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { useExtensionSlotMeta } from '@openmrs/esm-framework';
import ChartReview from './chart-review.component';

const mockUseExtensionSlotMeta = useExtensionSlotMeta as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useAssignedExtensions: jest.fn(),
    useExtensionSlotMeta: jest.fn(),
  };
});

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    Redirect: jest.fn(),
    useRouteMatch: jest.fn().mockReturnValue({
      url: '/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart',
    }),
  };
});

const gridBasedDashboards = {
  'charts-summary-dashboard': {
    name: 'summary',
    slot: 'patient-chart-summary-dashboard-slot',
    config: {
      columns: 4,
    },
    title: 'Patient Summary',
  },
  'test-results-summary-dashboard': {
    name: 'test-results',
    slot: 'patient-chart-test-results-dashboard-slot',
    config: {
      columns: 1,
    },
    title: 'Test Results',
  },
};

const testProps = {
  patient: mockPatient,
  patientUuid: mockPatient.id,
  subview: undefined,
  view: 'summary',
};

describe('ChartReview: ', () => {
  test(`renders a grid-based layout`, () => {
    mockUseExtensionSlotMeta.mockReturnValue(gridBasedDashboards);

    renderChartReview();

    expect(screen.getByRole('heading').textContent).toMatch(/Patient summary/i);
  });
});

function renderChartReview() {
  render(<ChartReview {...testProps} />);
}
