import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useConfig } from '@openmrs/esm-framework';
import { launchFormEntryOrHtmlForms, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit, mockForms } from '__mocks__';
import { mockPatient } from 'tools';
import FormView from './form-view.component';

const mockLaunchFormEntryOrHtmlForms = launchFormEntryOrHtmlForms as jest.Mock;
const mockShowModal = showModal as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    isDesktop: jest.fn(),
    showModal: jest.fn(),
    useConfig: jest.fn(),
    useConnectivity: jest.fn(),
    usePagination: jest.fn().mockImplementation((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
    })),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchFormEntryOrHtmlForms: jest.fn().mockImplementation((data) => {
      showModal(data);
    }),
    useVisitOrOfflineVisit: jest.fn(),
  };
});

describe('FormView', () => {
  test('should display `start-visit-dialog` when no visit has been started', async () => {
    const user = userEvent.setup();

    mockUseVisitOrOfflineVisit.mockReturnValueOnce({
      currentVisit: null,
    });
    mockUseConfig.mockReturnValue({ htmlFormEntryForms: [] });

    renderFormView();

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    await user.click(pocForm);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  test('should launch form-entry patient-workspace window when visit is started', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({ htmlFormEntryForms: [] });
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    renderFormView();

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    await user.click(pocForm);

    expect(mockLaunchFormEntryOrHtmlForms).toBeCalled();
  });
});

function renderFormView() {
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
}
