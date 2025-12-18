import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
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

    await screen.findByRole('heading', { name: /vitals/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
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
      // allow the time portion to vary across environments by using a permissive matcher
      /19 — May — 2021, .*? 37\s+121\s*\/\s*89\s+76\s+12\s+--/i,
      /10 — May — 2021, .*? 37\s+120\s*\/\s*90\s+66\s+45\s+90/i,
      /07 — May — 2021, .*? --\s+120\s*\/\s*80\s+--\s+--\s+--/i,
      /08 — Apr — 2021, .*? 36\.5\s+--\s*\/\s*--\s+78\s+65\s+--/i,
    ];

    expectedTableRows.forEach((row) =>
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
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
