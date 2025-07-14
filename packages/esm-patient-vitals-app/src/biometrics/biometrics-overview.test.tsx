/* eslint-disable testing-library/no-node-access */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { formattedBiometrics, mockBiometricsConfig, mockConceptUnits } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import BiometricsOverview from './biometrics-overview.component';

const testProps = {
  basePath: patientChartBasePath,
  patientUuid: mockPatient.id,
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);

jest.mock('../common', () => {
  const originalModule = jest.requireActual('../common');

  return {
    ...originalModule,
    useConceptUnits: jest.fn().mockImplementation(() => ({
      conceptUnits: mockConceptUnits,
      error: null,
      isLoading: false,
    })),
    useVitalsAndBiometrics: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  ...mockBiometricsConfig,
} as ConfigObject);

describe('Biometrics Overview', () => {
  it('renders an empty state view if biometrics data is unavailable', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

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

    mockUseVitalsAndBiometrics.mockReturnValue({
      error: mockError,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's biometrics data when available", async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });
    screen.getByRole('table', { name: /biometrics/i });
    expect(screen.getByRole('tab', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /chart view/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see all/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/date/, /weight/, /height/, /bmi/, /muac/];
    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /12 — Aug — 2021, 12:00 AM 90 186 26.0 17/,
      /18 — Jun — 2021, 12:00 AM 80 198 20.4 23/,
      /10 — Jun — 2021, 12:00 AM 50 -- -- --/,
      /26 — May — 2021, 12:00 AM 61 160 23.8 --/,
      /10 — May — 2021, 12:00 AM 90 198 23.0 25/,
    ];
    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());

    const sortRowsButton = screen.getByRole('button', { name: /date and time/i });

    const expectedDescendingOrder = [
      '12 — Aug — 2021, 12:00 AM',
      '18 — Jun — 2021, 12:00 AM',
      '10 — Jun — 2021, 12:00 AM',
      '26 — May — 2021, 12:00 AM',
      '10 — May — 2021, 12:00 AM',
    ];
    const expectedAscendingOrder = [
      '08 — Dec — 2020, 12:00 AM',
      '08 — Dec — 2020, 12:00 AM',
      '08 — Dec — 2020, 12:00 AM',
      '08 — Dec — 2020, 12:00 AM',
      '09 — Dec — 2020, 12:00 AM',
    ];

    const getRowDates = () =>
      screen
        .getAllByRole('row')
        .slice(1) // Exclude header row
        .map((row) => row.textContent?.match(/\d{1,2} — \w{3} — \d{4}, \d{1,2}:\d{2} (AM|PM)/)?.[0] || '');

    // Initial state should be descending
    expect(getRowDates()).toEqual(expectedDescendingOrder);

    // Sorting in descending order
    // Since the date order is already in descending order, the rows should be the same
    await user.click(sortRowsButton);
    // Sorting in ascending order
    await user.click(sortRowsButton);
    expect(getRowDates()).toEqual(expectedAscendingOrder);

    // Sorting order = NONE, hence it is still in the ascending order
    await user.click(sortRowsButton);
    // Sorting in descending order
    await user.click(sortRowsButton);

    expect(getRowDates()).toEqual(expectedDescendingOrder);
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics.slice(0, 2),
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

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
