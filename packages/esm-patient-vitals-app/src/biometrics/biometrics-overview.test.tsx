import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, NumericObservation, useConfig } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { formattedBiometrics, mockBiometricsConfig, mockConceptUnits } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import BiometricsOverview from './biometrics-overview.component';

const testProps = {
  basePath: patientChartBasePath,
  patientUuid: mockPatient.id,
  patient: mockPatient,
  visitContext: null,
  mutateVisitContext: null,
};

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = vi.mocked(useVitalsAndBiometrics);

vi.mock('../common', async () => {
  const originalModule = (await vi.importActual('../common')) as object;

  return {
    ...originalModule,
    useConceptUnits: vi.fn().mockImplementation(() => ({
      conceptUnits: mockConceptUnits,
      error: null,
      isLoading: false,
    })),
    useVitalsAndBiometrics: vi.fn(),
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

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(ErrorState).toHaveBeenCalledWith(
      expect.objectContaining({ error: mockError, headerTitle: 'Biometrics' }),
      {},
    );
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

    const dateColumnHeader = () => screen.getByRole('columnheader', { name: /date and time/i });

    // The first click sorts in ascending order, putting the oldest reading first
    await user.click(sortRowsButton);
    expect(dateColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual(expectedAscendingOrder);

    // The second click sorts in descending order, putting the newest reading first
    await user.click(sortRowsButton);
    expect(dateColumnHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(getRowDates()).toEqual(expectedDescendingOrder);
  });

  it('sorts across the whole dataset even when the visible page holds a single row', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      ...mockBiometricsConfig,
    } as ConfigObject);

    // The overview paginates five rows to a page, so a sixth reading leaves the
    // second page holding a single row. Carbon's comparator is never invoked
    // there, because `Array.prototype.sort` performs no comparisons on a
    // single-element array.
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics.slice(0, 6),
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

    await waitForLoadingToFinish();
    await screen.findByRole('table', { name: /biometrics/i });

    const getRowDates = () =>
      screen
        .getAllByRole('row')
        .slice(1) // Exclude the header row
        .map((row) => row.textContent?.match(/\d{1,2} — \w{3} — \d{4}/)?.[0])
        .filter(Boolean);

    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(getRowDates()).toEqual(['08 — Apr — 2021']);

    const dateColumnHeader = () => screen.getByRole('columnheader', { name: /date and time/i });

    await user.click(screen.getByRole('button', { name: /date and time/i }));

    expect(dateColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual(['12 — Aug — 2021']);
  });

  it('restores the unsorted order once the header cycles back to none', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      ...mockBiometricsConfig,
    } as ConfigObject);

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        { id: '0', date: '2021-08-12T00:00:00.000Z', weight: 90 },
        { id: '1', date: '2021-06-18T00:00:00.000Z', weight: 50 },
        { id: '2', date: '2021-06-10T00:00:00.000Z', weight: 70 },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);

    await waitForLoadingToFinish();
    await screen.findByRole('table', { name: /biometrics/i });

    const getRowDates = () =>
      screen
        .getAllByRole('row')
        .slice(1) // Exclude the header row
        .map((row) => row.textContent?.match(/\d{1,2} — \w{3} — \d{4}/)?.[0])
        .filter(Boolean);

    const unsortedOrder = ['12 — Aug — 2021', '18 — Jun — 2021', '10 — Jun — 2021'];
    expect(getRowDates()).toEqual(unsortedOrder);

    const sortRowsButton = screen.getByRole('button', { name: /weight/i });
    const weightColumnHeader = () => screen.getByRole('columnheader', { name: /weight/i });

    await user.click(sortRowsButton);
    expect(weightColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual(['18 — Jun — 2021', '10 — Jun — 2021', '12 — Aug — 2021']);

    await user.click(sortRowsButton);
    expect(weightColumnHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(getRowDates()).toEqual(['12 — Aug — 2021', '10 — Jun — 2021', '18 — Jun — 2021']);

    // The third click clears the sort, so the rows return to their original order
    await user.click(sortRowsButton);
    expect(weightColumnHeader()).toHaveAttribute('aria-sort', 'none');
    expect(getRowDates()).toEqual(unsortedOrder);
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

  it('hides BMI column in table view when bmiMinimumAge is set and patient is under the minimum age', async () => {
    const minorPatient = {
      ...mockPatient,
      birthDate: '2020-01-01',
    };

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      ...mockBiometricsConfig,
      biometrics: {
        ...mockBiometricsConfig.biometrics,
        bmiMinimumAge: 18,
      },
    } as ConfigObject);

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} patient={minorPatient} />);

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });

    // BMI column should not be present
    expect(screen.queryByRole('columnheader', { name: /bmi/i })).not.toBeInTheDocument();

    // Other columns should still be present
    expect(screen.getByRole('columnheader', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /muac/i })).toBeInTheDocument();
  });

  it('passes interpretation and concept UUID to NumericObservation for each biometric cell', async () => {
    const mockNumericObservation = vi.mocked(NumericObservation);
    mockNumericObservation.mockClear();

    const defaults = getDefaultsFromConfigSchema(configSchema) as ConfigObject;

    mockUseConfig.mockReturnValue({
      ...defaults,
      ...mockBiometricsConfig,
    } as ConfigObject);

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        {
          id: 'enc-1',
          date: '2021-08-12T00:00:00.000Z',
          weight: 90,
          height: 186,
          bmi: 17,
          bmiRenderInterpretation: 'critically_low',
          muac: 17,
        },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} />);
    await waitForLoadingToFinish();
    await screen.findByRole('table', { name: /biometrics/i });

    expect(mockNumericObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 17,
        interpretation: 'critically_low',
        conceptUuid: defaults.concepts.bodyMassIndexUuid,
        variant: 'cell',
        patientUuid: mockPatient.id,
      }),
      expect.anything(),
    );
    expect(mockNumericObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 90,
        conceptUuid: defaults.concepts.weightUuid,
        variant: 'cell',
      }),
      expect.anything(),
    );
  });

  it('shows BMI column for a 20-month-old patient when bmiMinimumAge is 1', async () => {
    const toddlerPatient = {
      ...mockPatient,
      birthDate: dayjs().subtract(20, 'months').format('YYYY-MM-DD'),
    };

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      ...mockBiometricsConfig,
      biometrics: {
        ...mockBiometricsConfig.biometrics,
        bmiMinimumAge: 1,
      },
    } as ConfigObject);

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedBiometrics,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<BiometricsOverview {...testProps} patient={toddlerPatient} />);

    await waitForLoadingToFinish();

    await screen.findByRole('heading', { name: /biometrics/i });

    // A 20-month-old is 1 year old, so BMI should be shown
    expect(screen.getByRole('columnheader', { name: /bmi/i })).toBeInTheDocument();
  });
});
