import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { extensionStore, useAssignedExtensionIds, useExtensionSlotMeta } from '@openmrs/esm-framework';
import ChartReview from './chart-review.component';

const mockUseAssignedExtensionIds = useAssignedExtensionIds as jest.Mock;
const mockUseExtensionSlotMeta = useExtensionSlotMeta as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useAssignedExtensionIds: jest.fn(),
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

const tabBasedDashboards = {
  'results-summary-dashboard': {
    name: 'vitalsAndBiometrics',
    slot: 'patient-chart-results-dashboard-slot',
    config: {
      type: 'tabs',
    },
    title: 'Vitals & Biometrics',
  },
};

const gridBasedDashboards = {
  'charts-summary-dashboard': {
    name: 'summary',
    slot: 'patient-chart-summary-dashboard-slot',
    config: {
      columns: 4,
      type: 'grid',
    },
    title: 'Patient Summary',
  },
  'test-results-summary-dashboard': {
    name: 'test-results',
    slot: 'patient-chart-test-results-dashboard-slot',
    config: {
      columns: 1,
      type: 'grid',
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
  test(`renders a grid-based layout if the provided config's layout type value is 'grid'`, () => {
    mockUseExtensionSlotMeta.mockReturnValue(gridBasedDashboards);

    renderChartReview();

    expect(screen.getByRole('heading').textContent).toMatch(/Patient summary/i);
  });

  test(`renders a tabs-based layout if the provided config's layout type value is 'tabs'`, () => {
    testProps.subview = 'vitals';
    testProps.view = 'vitalsAndBiometrics';

    jest.spyOn(extensionStore, 'getState').mockReturnValue({
      extensions: {
        'biometrics-details-widget': {
          instances: {},
          load: jest.fn(),
          meta: { view: 'biometrics', title: 'Biometrics' },
          moduleName: '@openmrs/esm-patient-biometrics-app',
          name: 'biometrics-details-widget',
        },
        'vitals-details-widget': {
          instances: {},
          load: jest.fn(),
          meta: { view: 'vitals', title: 'Vitals' },
          moduleName: '@openmrs/esm-patient-vitals-app',
          name: 'vitals-details-widget',
        },
      },
      slots: {
        'patient-chart-summary-dashboard-slot': {
          name: 'patient-chart-summary-dashboard-slot',
          attachedIds: [
            'biometrics-overview-widget',
            'appointments-overview-widget',
            'forms-widget',
            'vitals-overview-widget',
            'immunization-overview-widget',
            'notes-overview-widget',
            'active-medications-widget',
            'conditions-overview-widget',
            'programs-overview-widget',
            'allergies-overview-widget',
            'test-results-summary-widget',
            'patient-clinical-view-overview',
          ],
          instances: {},
        },
      },
    });
    mockUseAssignedExtensionIds.mockReturnValue(['vitals-details-widget', 'biometrics-details-widget']);
    mockUseExtensionSlotMeta.mockReturnValue(tabBasedDashboards);

    renderChartReview();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toEqual(2);
    expect(screen.getByRole('button', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /biometrics/i })).toBeInTheDocument();
  });
});

function renderChartReview() {
  render(<ChartReview {...testProps} />);
}
