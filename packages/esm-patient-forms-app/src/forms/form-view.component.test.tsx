import React from 'react';
import { render, screen } from '@testing-library/react';
import FormView from './form-view.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockForms } from '../../../../__mocks__/forms.mock';
import userEvent from '@testing-library/user-event';
import { showModal, useConfig } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { useVisitOrOfflineVisit, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;
const mockShowModal = showModal as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockLaunchPatientWorkspace = launchPatientWorkspace as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
    })),
    useConnectivity: jest.fn(),
    showModal: jest.fn(),
    useConfig: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...(jest.requireActual('@openmrs/esm-patient-common-lib') as any),
  useVisitOrOfflineVisit: jest.fn(),
  launchPatientWorkspace: jest.fn(),
}));

describe('FormView', () => {
  test('should display `start-visit-dialog` when no visit has been started', async () => {
    mockUseVisitOrOfflineVisit.mockReturnValueOnce({
      currentVisit: null,
    });
    mockUseConfig.mockReturnValue({ htmlFormEntryForms: [] });
    render(
      <FormView
        patientUuid={mockPatient.id}
        forms={mockForms}
        pageSize={5}
        pageUrl={'/some-url'}
        patient={mockPatient}
        urlLabel="some-url-label"
      />,
    );

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    userEvent.click(pocForm);
    expect(mockShowModal).toHaveBeenCalledWith('start-visit-dialog', { closeModal: jasmine.anything() });
  });

  test('should launch form-entry patient-workspace window when visit is started', async () => {
    mockUseConfig.mockReturnValue({ htmlFormEntryForms: [] });
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });
    render(
      <FormView
        patientUuid={mockPatient.id}
        forms={mockForms}
        pageSize={5}
        pageUrl={'/some-url'}
        patient={mockPatient}
        urlLabel="some-url-label"
      />,
    );

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    userEvent.click(pocForm);
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      workspaceTitle: 'POC COVID 19 Assessment Form v1.1',
    });
  });
});
