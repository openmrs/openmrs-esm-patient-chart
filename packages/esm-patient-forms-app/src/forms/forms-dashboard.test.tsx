import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit } from '__mocks__';
import FormsDashboard from './forms-dashboard.component';

const mockUseConfig = useConfig as jest.Mock;
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValueOnce({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVisitOrOfflineVisit: jest.fn(),
  };
});

describe('FormsDashboard', () => {
  test('renders an empty state if there are no forms persisted on the server', async () => {
    mockUseConfig.mockReturnValue({ htmlFormEntryForms: [] });

    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    renderFormDashboard();

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});

function renderFormDashboard() {
  render(<FormsDashboard />);
}
