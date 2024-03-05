import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig, usePagination } from '@openmrs/esm-framework';
import { configSchema } from '../config-schema';
import { formattedVitals, mockConceptMetadata, mockConceptUnits, mockVitalsConfig } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import VitalsOverview from './vitals-overview.component';

defineConfigSchema('@openmrs/esm-patient-vitals-app', configSchema);
const mockedUseConfig = jest.mocked(useConfig);
const mockedUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockUsePagination = jest.mocked(usePagination);

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

jest.mock('../common', () => {
  const originalModule = jest.requireActual('../common');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

describe('VitalsOverview', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), mockVitalsConfig });
    jest.clearAllMocks();
  });

  it('renders an empty state view if vitals data is unavailable', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsOverview();

    await waitForLoadingToFinish();
    await screen.findByRole('heading', { name: /vitals/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/There are no vital signs to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/record vital signs/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching allergies data', async () => {
    const mockError = {
      message: '401 Unauthorized',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    } as unknown as Error;

    mockedUseVitalsAndBiometrics.mockReturnValue({
      error: mockError,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.findByRole('heading', { name: /vitals/i }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's vital signs", async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    mockUsePagination.mockReturnValue({
      currentPage: 1,
      goTo: () => {},
      results: formattedVitals.slice(0, 5),
      totalPages: formattedVitals.length / 5,
      paginated: true,
      showNextButton: true,
      showPreviousButton: false,
      goToNext: undefined,
      goToPrevious: undefined,
    } as ReturnType<typeof usePagination>);

    renderVitalsOverview();

    await waitForLoadingToFinish();
    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/date and time/, /bp/, /r. rate/, /pulse/, /spO2/, /temp/];
    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [/37 76 12/, /37 66 45 90/, /36.5 78 65/];
    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    mockUsePagination.mockReturnValue({
      currentPage: 1,
      goTo: () => {},
      results: formattedVitals.slice(0, 5),
      totalPages: formattedVitals.length / 5,
      paginated: true,
      showNextButton: true,
      showPreviousButton: false,
      goToNext: undefined,
      goToPrevious: undefined,
    } as ReturnType<typeof usePagination>);

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('tab', {
      name: /chart view/i,
    });

    await user.click(chartViewButton);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /spo2/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /temp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /r\. rate/i })).toBeInTheDocument();
  });
});

function renderVitalsOverview() {
  const testProps = {
    patientUuid: mockPatient.id,
    pageSize: 5,
    pageUrl: '',
    urlLabel: '',
  };

  renderWithSwr(<VitalsOverview {...testProps} />);
}
