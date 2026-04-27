import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject, configSchema } from '../config-schema';
import { formattedVitals, mockConceptUnits, mockVitalsConfig } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { useVitalsAndBiometrics } from '../common';
import VitalsOverview from './vitals-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
  patient: mockPatient,
  pageSize: 5,
  pageUrl: '',
  urlLabel: '',
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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
  mockVitalsConfig,
} as ConfigObject);

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
    expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /spo2/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /temp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /r\. rate/i })).toBeInTheDocument();
  });
});
