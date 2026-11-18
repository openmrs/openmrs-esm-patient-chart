import React from 'react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject, configSchema } from '../config-schema';
import { formattedVitals, mockConceptUnits, mockVitalsConfig } from '__mocks__';
import { capturePrintJobs, mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import VitalsOverview from './vitals-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
  patient: mockPatient,
  pageSize: 5,
  pageUrl: '',
  urlLabel: '',
};

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = vi.mocked(useVitalsAndBiometrics);

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

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
  ...mockVitalsConfig,
} as ConfigObject);

const getRowDates = (container: HTMLElement = document.body) =>
  within(container)
    .getAllByRole('row')
    .slice(1) // Exclude the header row
    .map((row) => row.textContent?.match(/\d{1,2} — \w{3} — \d{4}/)?.[0])
    .filter(Boolean);

describe('VitalsOverview', () => {
  it('renders an empty state view if vitals data is unavailable', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

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

    mockUseVitalsAndBiometrics.mockReturnValue({
      error: mockError,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(ErrorState).toHaveBeenCalledWith(expect.objectContaining({ error: mockError, headerTitle: 'Vitals' }), {});
  });

  it("renders a tabular overview of the patient's vital signs", async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();
    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const initialRowElements = screen.getAllByRole('row');

    const expectedColumnHeaders = [/date and time/, /bp/, /r. rate/, /pulse/, /spO2/, /temp/];

    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /19 .* May .* 2021, .* 37 121 \/ 89 76 12 --/,
      /10 .* May .* 2021, .* 37 120 \/ 90 66 45 90/,
      /07 .* May .* 2021, .* -- 120 \/ 80 -- -- --/,
      /08 .* Apr .* 2021, .* 36.5 -- \/ -- 78 65 --/,
    ];
    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });

  it('sorts the vitals table in the direction indicated by the column header', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();
    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const expectedDescendingOrder = ['19 — May — 2021', '10 — May — 2021', '07 — May — 2021', '08 — Apr — 2021'];
    const expectedAscendingOrder = [...expectedDescendingOrder].reverse();

    expect(getRowDates()).toEqual(expectedDescendingOrder);

    const sortRowsButton = screen.getByRole('button', { name: /date and time/i });
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

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    // With one row per page Carbon's comparator is never invoked, because
    // `Array.prototype.sort` performs no comparisons on a single-element array.
    renderWithSwr(<VitalsOverview {...testProps} pageSize={1} />);

    await waitForLoadingToFinish();

    expect(getRowDates()).toEqual(['19 — May — 2021']);

    const dateColumnHeader = () => screen.getByRole('columnheader', { name: /date and time/i });

    await user.click(screen.getByRole('button', { name: /date and time/i }));

    expect(dateColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual(['08 — Apr — 2021']);
  });

  it('restores the unsorted order once the header cycles back to none', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        { id: '0', date: '2021-05-19T04:26:51.000Z', pulse: 90 },
        { id: '1', date: '2021-05-10T06:41:46.000Z', pulse: 60 },
        { id: '2', date: '2021-05-07T09:04:51.000Z', pulse: 75 },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();

    const unsortedOrder = ['19 — May — 2021', '10 — May — 2021', '07 — May — 2021'];
    expect(getRowDates()).toEqual(unsortedOrder);

    const sortRowsButton = screen.getByRole('button', { name: /pulse/i });
    const pulseColumnHeader = () => screen.getByRole('columnheader', { name: /pulse/i });

    await user.click(sortRowsButton);
    expect(pulseColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual(['10 — May — 2021', '07 — May — 2021', '19 — May — 2021']);

    await user.click(sortRowsButton);
    expect(pulseColumnHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(getRowDates()).toEqual(['19 — May — 2021', '07 — May — 2021', '10 — May — 2021']);

    // The third click clears the sort, so the rows return to their original order
    await user.click(sortRowsButton);
    expect(pulseColumnHeader()).toHaveAttribute('aria-sort', 'none');
    expect(getRowDates()).toEqual(unsortedOrder);
  });

  it('sorts a column with missing values, keeping the rows without a value last in either direction', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        { id: '0', date: '2021-05-19T09:00:00.000Z', temperature: 39.1 },
        { id: '1', date: '2021-05-10T09:00:00.000Z', pulse: 80 },
        { id: '2', date: '2021-05-07T09:00:00.000Z', temperature: 36.5 },
        { id: '3', date: '2021-04-08T09:00:00.000Z', temperature: 38.2 },
        { id: '4', date: '2021-04-01T09:00:00.000Z', pulse: 72 },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();

    const sortRowsButton = screen.getByRole('button', { name: /temp/i });
    const temperatureColumnHeader = () => screen.getByRole('columnheader', { name: /temp/i });

    await user.click(sortRowsButton);
    expect(temperatureColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual([
      '07 — May — 2021', // 36.5
      '08 — Apr — 2021', // 38.2
      '19 — May — 2021', // 39.1
      '10 — May — 2021', // no temperature
      '01 — Apr — 2021', // no temperature
    ]);

    await user.click(sortRowsButton);
    expect(temperatureColumnHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(getRowDates()).toEqual([
      '19 — May — 2021', // 39.1
      '08 — Apr — 2021', // 38.2
      '07 — May — 2021', // 36.5
      '10 — May — 2021', // no temperature
      '01 — Apr — 2021', // no temperature
    ]);
  });

  it('sorts blood pressure by systolic, then diastolic, keeping missing readings last in either direction', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        { id: '0', date: '2021-05-19T09:00:00.000Z', systolic: 120, diastolic: 85 },
        { id: '1', date: '2021-05-10T09:00:00.000Z', systolic: 120, diastolic: 75 },
        { id: '2', date: '2021-05-07T09:00:00.000Z', temperature: 37 },
        { id: '3', date: '2021-04-08T09:00:00.000Z', systolic: 110, diastolic: 70 },
        { id: '4', date: '2021-04-01T09:00:00.000Z', systolic: 120 },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();

    const sortRowsButton = screen.getByRole('button', { name: /\bbp\b/i });
    const bloodPressureColumnHeader = () => screen.getByRole('columnheader', { name: /\bbp\b/i });

    await user.click(sortRowsButton);
    expect(bloodPressureColumnHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowDates()).toEqual([
      '08 — Apr — 2021', // 110 / 70
      '10 — May — 2021', // 120 / 75
      '19 — May — 2021', // 120 / 85
      '01 — Apr — 2021', // 120 / no diastolic
      '07 — May — 2021', // no blood pressure
    ]);

    await user.click(sortRowsButton);
    expect(bloodPressureColumnHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(getRowDates()).toEqual([
      '19 — May — 2021', // 120 / 85
      '10 — May — 2021', // 120 / 75
      '01 — Apr — 2021', // 120 / no diastolic
      '08 — Apr — 2021', // 110 / 70
      '07 — May — 2021', // no blood pressure
    ]);
  });

  it('expands a vitals row to show an associated note', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);
    await waitForLoadingToFinish();

    // Rows with notes (first two) have expand buttons
    const rows = screen.getAllByRole('row');
    const expandButtons = rows
      .map((row) => within(row).queryByRole('button', { name: /expand current row/i }))
      .filter(Boolean);
    expect(expandButtons.length).toBeGreaterThan(0);
    expect(expandButtons[0]).toBeVisible();
    expect(expandButtons[1]).toBeVisible();

    // Expand the first row and verify the note text appears
    await user.click(expandButtons[0]);
    expect(screen.getByText(/Pt reports severe L chest pain/i)).toBeInTheDocument();

    // Collapse and verify the note text is removed
    await user.click(expandButtons[0]);
    expect(screen.queryByText(/Pt reports severe L chest pain/i)).not.toBeInTheDocument();

    // Expand the second row and verify its note text appears
    await user.click(expandButtons[1]);
    expect(screen.getByText(/Follow up in 2 weeks/i)).toBeInTheDocument();

    // Collapse the second row
    await user.click(expandButtons[1]);
    expect(screen.queryByText(/Follow up in 2 weeks/i)).not.toBeInTheDocument();
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('tab', {
      name: /chart view/i,
    });

    await user.click(chartViewButton);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(await screen.findByText(/vital sign displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /spo2/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /temp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /r\. rate/i })).toBeInTheDocument();
  });

  it('prints every vitals row with notes expanded, then restores the paginated table', async () => {
    const user = userEvent.setup();
    const printJobs = capturePrintJobs();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      ...mockVitalsConfig,
      vitals: { ...mockVitalsConfig.vitals, showPrintButton: true },
    } as ConfigObject);
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsOverview {...testProps} pageSize={2} />);
    await waitForLoadingToFinish();

    expect(getRowDates()).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /print/i }));
    await waitFor(() => expect(printJobs).toHaveLength(1));

    const [{ content, documentTitle }] = printJobs;
    expect(documentTitle).toBe('OpenMRS - John Wilson - Vitals');
    expect(content).toHaveTextContent('John Wilson');
    expect(within(content).getAllByRole('heading', { name: 'Vitals' })).toHaveLength(1);
    expect(getRowDates(content)).toHaveLength(formattedVitals.length);
    expect(content).toHaveTextContent(/Pt reports severe L chest pain/i);
    expect(content).toHaveTextContent(/Follow up in 2 weeks/i);
    expect(content).not.toHaveTextContent(/items/i);

    await waitFor(() => expect(getRowDates()).toHaveLength(2));
    expect(screen.queryByText(/Pt reports severe L chest pain/i)).not.toBeInTheDocument();
    expect(screen.getByText(`2 / ${formattedVitals.length} items`)).toBeInTheDocument();
  });

  describe('chart loading', () => {
    const loadChart = vi.fn();

    // Fresh module instances give each test its own React.lazy state and chart import.
    const renderWithMockedChart = async () => {
      vi.resetModules();
      vi.doMock('./vitals-chart.component', () => loadChart());
      const { useConfig: freshUseConfig } = await import('@openmrs/esm-framework');
      const { useVitalsAndBiometrics: freshUseVitalsAndBiometrics } = await import('../common');
      const { default: FreshVitalsOverview } = await import('./vitals-overview.component');
      vi.mocked(freshUseConfig<ConfigObject>).mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        ...mockVitalsConfig,
      } as ConfigObject);
      vi.mocked(freshUseVitalsAndBiometrics).mockReturnValue({
        data: formattedVitals,
      } as ReturnType<typeof useVitalsAndBiometrics>);
      renderWithSwr(<FreshVitalsOverview {...testProps} />);
      await waitForLoadingToFinish();
    };

    afterEach(() => {
      vi.doUnmock('./vitals-chart.component');
      loadChart.mockReset();
    });

    it('starts loading the chart when the view switcher is hovered', async () => {
      const user = userEvent.setup();
      loadChart.mockReturnValue({ default: () => <p>Mock vitals chart</p> });

      await renderWithMockedChart();
      expect(loadChart).not.toHaveBeenCalled();

      await user.hover(screen.getByRole('tab', { name: /chart view/i }));

      await waitFor(() => expect(loadChart).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();
    });

    it('ignores a failed prefetch', async () => {
      const user = userEvent.setup();
      loadChart.mockImplementation(() => {
        throw new Error('Loading chunk failed');
      });

      await renderWithMockedChart();
      await user.hover(screen.getByRole('tab', { name: /chart view/i }));

      await waitFor(() => expect(loadChart).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();
    });
  });
});
