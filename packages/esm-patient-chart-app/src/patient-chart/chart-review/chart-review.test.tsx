import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen, render } from '@testing-library/react';
import {
  type AssignedExtension,
  type ExtensionSlotState,
  useExtensionStore,
  useExtensionSlotMeta,
} from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import ChartReview from './chart-review.component';

const mockUseExtensionStore = jest.mocked(useExtensionStore);
const mockUseExtensionSlotMeta = jest.mocked(useExtensionSlotMeta);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    useNavGroups: jest.fn().mockReturnValue({ navGroups: [] }),
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Redirect: jest.fn(),
  useMatch: jest.fn().mockReturnValue({
    params: {
      url: '/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart',
      view: 'Patient Summary',
    },
  }),
}));

function slotMetaFromStore(store, slotName) {
  return Object.fromEntries(
    store.slots[slotName].assignedExtensions.map((e) => {
      return [e.name, e.meta];
    }),
  );
}

describe('ChartReview', () => {
  test('renders a grid-based layout', () => {
    const mockStore = {
      slots: {
        'patient-chart-dashboard-slot': {
          assignedExtensions: [
            {
              name: 'charts-summary-dashboard',
              meta: {
                slot: 'patient-chart-summary-dashboard-slot',
                path: 'Patient Summary',
                title: 'Patient Summary',
              },
            },
            {
              name: 'test-results-summary-dashboard',
              meta: {
                slot: 'patient-chart-test-results-dashboard-slot',
                path: 'Test Results',
                title: 'Test Results',
              },
            },
          ] as unknown as AssignedExtension[],
        },
        'patient-chart-summary-dashboard-slot': {
          assignedExtensions: [],
        },
      } as Record<string, ExtensionSlotState>,
    };

    mockUseExtensionStore.mockReturnValue(mockStore as unknown as ReturnType<typeof useExtensionStore>);
    mockUseExtensionSlotMeta.mockImplementation((slotName) => slotMetaFromStore(mockStore, slotName));

    render(
      <BrowserRouter>
        <ChartReview patient={mockPatient} patientUuid={mockPatient.id} view="Patient Summary" />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/Patient summary/i);
  });
});
