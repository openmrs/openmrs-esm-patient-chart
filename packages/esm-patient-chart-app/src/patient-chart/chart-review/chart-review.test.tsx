import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen, render } from '@testing-library/react';
import { useExtensionSlotMeta, useExtensionStore } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import ChartReview from './chart-review.component';

const mockUseExtensionStore = useExtensionStore as jest.Mock;
const mockUseExtensionSlotMeta = useExtensionSlotMeta as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    useNavGroups: jest.fn().mockReturnValue({ navGroups: [] }),
  };
});
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useExtensionStore: jest.fn(),
  useExtensionSlotMeta: jest.fn(),
}));

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
  test(`renders a grid-based layout`, () => {
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
          ],
        },
        'patient-chart-summary-dashboard-slot': {
          assignedExtensions: [],
        },
      },
    };
    mockUseExtensionStore.mockReturnValue(mockStore);
    mockUseExtensionSlotMeta.mockImplementation((slotName) => slotMetaFromStore(mockStore, slotName));

    render(
      <BrowserRouter>
        <ChartReview patient={mockPatient} patientUuid={mockPatient.id} view="Patient Summary" />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/Patient summary/i);
  });
});
