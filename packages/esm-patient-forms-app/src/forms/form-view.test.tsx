import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showModal, useConfig } from '@openmrs/esm-framework';
import { launchFormEntryOrHtmlForms, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockCurrentVisit, mockForms } from '__mocks__';
import { mockPatient } from 'tools';
import FormView from './form-view.component';

const mockLaunchFormEntryOrHtmlForms = launchFormEntryOrHtmlForms as jest.Mock;
const mockShowModal = jest.mocked(showModal);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

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

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  htmlFormEntryForms: [],
});

describe('FormView', () => {
  test('should display `start-visit-dialog` when no visit has been started', async () => {
    const user = userEvent.setup();

    mockUseVisitOrOfflineVisit.mockReturnValueOnce({
      currentVisit: null,
    });

    renderFormView();

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    await user.click(pocForm);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  test('should launch form-entry patient-workspace window when visit is started', async () => {
    const user = userEvent.setup();

    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    renderFormView();

    const pocForm = await screen.findByText('POC COVID 19 Assessment Form v1.1');
    expect(pocForm).toBeInTheDocument();

    await user.click(pocForm);

    expect(mockLaunchFormEntryOrHtmlForms).toHaveBeenCalled();
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
