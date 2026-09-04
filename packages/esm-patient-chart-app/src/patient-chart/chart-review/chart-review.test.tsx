import React from 'react';
import { vi, describe, expect, test } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { screen, render } from '@testing-library/react';
import { useAssignedExtensions, useExtensionStore } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import ChartReview from './chart-review.component';

const mockUseAssignedExtensions = vi.mocked(useAssignedExtensions);
const mockUseExtensionStore = vi.mocked(useExtensionStore);

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  Redirect: vi.fn(),
  useMatch: vi.fn().mockReturnValue({
    params: {
      url: '/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart',
      view: 'patient-summary',
    },
  }),
}));

describe('ChartReview', () => {
  test('renders a grid-based layout', () => {
    const mockStore = {
      slots: {
        'patient-chart-dashboard-slot': {
          candidateExtensions: [
            {
              name: 'charts-summary-dashboard',
              meta: {
                slot: 'patient-chart-summary-dashboard-slot',
                path: 'patient-summary',
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
          candidateExtensions: [],
        },
      },
    };

    mockUseExtensionStore.mockReturnValue(mockStore as unknown as ReturnType<typeof useExtensionStore>);
    mockUseAssignedExtensions.mockImplementation((slotName) => mockStore.slots[slotName]?.candidateExtensions ?? []);

    render(
      <BrowserRouter>
        <ChartReview patient={mockPatient} patientUuid={mockPatient.id} view="patient-summary" />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/Patient summary/i);
  });
});
