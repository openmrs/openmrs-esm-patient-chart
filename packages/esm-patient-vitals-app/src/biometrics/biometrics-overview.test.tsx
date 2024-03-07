import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig, usePagination } from '@openmrs/esm-framework';
import { formattedBiometrics, mockBiometricsConfig, mockConceptMetadata, mockConceptUnits } from '__mocks__';
import { configSchema } from '../config-schema';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import BiometricsOverview from './biometrics-overview.component';

defineConfigSchema('@openmrs/esm-patient-vitals-app', configSchema);
const mockedUseConfig = jest.mocked(useConfig);
const mockedUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockUsePagination = jest.mocked(usePagination);

jest.mock('../common', () => {
  const originalModule = jest.requireActual('../common');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

describe('BiometricsOverview: ', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), mockBiometricsConfig });
    jest.clearAllMocks();
  });

  it('renders an empty state view if biometrics data is unavailable', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/There are no biometrics to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record biometrics/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching biometrics data', async () => {
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

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    expect(screen.findByRole('heading', { name: /biometrics/i }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's biometrics data when available", async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    mockUsePagination.mockReturnValue({
      currentPage: 1,
      goTo: () => {},
      results: formattedBiometrics.slice(0, 5),
      totalPages: formattedBiometrics.length / 5,
      paginated: true,
      showNextButton: true,
      showPreviousButton: false,
      goToNext: () => {},
      goToPrevious: () => {},
    });

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });
    await screen.findByRole('table', { name: /biometrics/i });
    expect(screen.getByRole('tab', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /chart view/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see all/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/date/, /weight/, /height/, /bmi/, /muac/];
    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [/90 186 26.0 17/, /80 198 20.4 23/, /50/, /61 160 23.8/, /90 198 23.0 25/];
    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics.slice(0, 2),
    } as ReturnType<typeof useVitalsAndBiometrics>);

    mockUsePagination.mockReturnValue({
      currentPage: 1,
      goTo: () => {},
      results: formattedBiometrics.slice(0, 5),
      totalPages: formattedBiometrics.length / 5,
      paginated: true,
      showNextButton: true,
      showPreviousButton: false,
      goToNext: undefined,
      goToPrevious: undefined,
    });

    renderBiometricsOverview();

    await waitForLoadingToFinish();
    await screen.findByRole('table', { name: /biometrics/i });

    const chartViewButton = screen.getByRole('tab', {
      name: /chart view/i,
    });

    await user.click(chartViewButton);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/biometric displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bmi/i })).toBeInTheDocument();
  });
});

function renderBiometricsOverview() {
  const testProps = {
    basePath: patientChartBasePath,
    patientUuid: mockPatient.id,
  };

  renderWithSwr(<BiometricsOverview {...testProps} />);
}
