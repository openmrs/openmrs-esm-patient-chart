import React from 'react';
import dayjs from 'dayjs';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useVisit } from '@openmrs/esm-framework';
import { mockPatient, getByTextWithMarkup, renderWithSwr, waitForLoadingToFinish } from 'tools';
import {
  formattedVitals,
  mockConceptUnits,
  mockOngoingVisitWithEncounters,
  mockVitalsConceptMetadata,
  mockVitalsConfig,
} from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { type PatientVitalsAndBiometrics, useVitalsAndBiometrics } from '../common';
import VitalsHeader from './vitals-header.extension';

const testProps = {
  patientUuid: mockPatient.id,
  showRecordVitalsButton: true,
  visitContext: mockOngoingVisitWithEncounters,
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);

const mockLaunchWorkspaceRequiringVisit = jest.fn();
const mockUseLaunchWorkspaceRequiringVisit = jest.fn().mockImplementation((name) => {
  return () => mockLaunchWorkspaceRequiringVisit(name);
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: jest.fn().mockImplementation(() => mockUseLaunchWorkspaceRequiringVisit),
  };
});

jest.mock('../common/data.resource', () => {
  const originalModule = jest.requireActual('../common/data.resource');

  return {
    ...originalModule,
    useConceptUnits: jest.fn().mockImplementation(() => ({
      conceptUnits: mockConceptUnits,
      error: null,
      isLoading: false,
    })),
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => mockVitalsConceptMetadata),
    useVitalsAndBiometrics: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  mockVitalsConfig,
} as ConfigObject);

describe('VitalsHeader', () => {
  it('renders an empty state view when there are no vitals data to show', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/vitals and biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/no data has been recorded for this patient/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record vitals/i })).toBeInTheDocument();
  });

  it('renders the most recently recorded values in the vitals header', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: [
        {
          id: '0',
          date: '2021-05-19T04:26:51.000Z',
          pulse: 76,
          temperature: 37,
          respiratoryRate: 12,
          diastolic: 89,
          systolic: 121,
          bmi: null,
          muac: 23,
          bloodPressureRenderInterpretation: 'normal',
        },
      ],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/vitals and biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/19-May-2021/i)).toBeInTheDocument();
    expect(screen.getByText(/vitals history/i)).toBeInTheDocument();
    expect(screen.getByText(/record vitals/i)).toBeInTheDocument();

    expect(getByTextWithMarkup(/BP\s*121 \/ 89\s*mmHg/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Temp\s*37\s*DEG C/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Heart rate\s*76\s*beats\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/SpO2\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/R\. Rate\s*12\s*breaths\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Height\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/BMI\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Weight\s*-\s*/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/MUAC\s*23\s*cm/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/these vitals are out of date/i)).toBeInTheDocument();
  });

  it('launches the vitals form when the `record vitals` button is clicked', async () => {
    const user = userEvent.setup();

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await user.click(recordVitalsButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledTimes(1);
  });

  it('displays correct overdue tag for vitals 5 days old', async () => {
    const fiveDaysAgo = dayjs().subtract(5, 'days').toISOString();
    const vitalsData = [
      {
        ...formattedVitals[0],
        date: fiveDaysAgo,
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsData,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(getByTextWithMarkup(/These vitals are 5 days old/i)).toBeInTheDocument();
  });

  it('displays correct overdue tag for vitals 1 day old', async () => {
    const oneDayAgo = dayjs().subtract(1, 'days').toISOString();
    const vitalsData = [
      {
        ...formattedVitals[0],
        date: oneDayAgo,
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsData,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(getByTextWithMarkup(/These vitals are 1 day old/i)).toBeInTheDocument();
  });

  it('does not flag normal values that lie within the provided reference ranges', async () => {
    const normalVitals = [
      {
        id: '0',
        date: '2021-05-19T04:26:51.000Z',
        pulse: 76,
        temperature: 37,
        respiratoryRate: 12,
        diastolic: 75, // Within normal range (60-80)
        systolic: 115, // Within normal range (90-120)
        bmi: null,
        muac: 23,
        bloodPressureRenderInterpretation: 'normal',
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: normalVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.queryByTitle(/abnormal value/i)).not.toBeInTheDocument();
  });

  it('flags abnormal values that lie outside of the provided reference ranges', async () => {
    const abnormalVitals = [
      {
        id: '6f4ed885-2bc1-4ed4-92e5-3dddb9180f30',
        date: '2022-05-19T00:00:00.000Z',
        systolic: 165,
        diastolic: 150,
        bloodPressureRenderInterpretation: 'critically_high',
        pulse: 76,
        spo2: undefined,
        temperature: 37,
        respiratoryRate: 12,
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: abnormalVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByTitle(/abnormal value/i)).toBeInTheDocument();
  });

  it('should launch Form Entry vitals and biometrics form', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      vitals: { ...mockVitalsConfig.vitals, useFormEngine: true, formName: 'Triage' },
    } as ConfigObject);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await user.click(recordVitalsButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledTimes(1);
  });

  it('should show links in vitals header by default', async () => {
    const fiveDaysAgo = dayjs().subtract(5, 'days').toISOString();
    const vitalsData = [
      {
        ...formattedVitals[0],
        date: fiveDaysAgo,
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsData,
    } as ReturnType<typeof useVitalsAndBiometrics>);
    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('link', { name: /vitals history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^record vitals$/i })).toBeInTheDocument();
  });

  it('should show not links in vitals header when hideLinks is true', async () => {
    const fiveDaysAgo = dayjs().subtract(5, 'days').toISOString();
    const vitalsData = [
      {
        ...formattedVitals[0],
        date: fiveDaysAgo,
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsData,
    } as ReturnType<typeof useVitalsAndBiometrics>);
    renderWithSwr(<VitalsHeader {...{ ...testProps, hideLinks: true }} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('link', { name: /vitals history/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /record vitals/i })).not.toBeInTheDocument();
  });

  it('uses backend interpretation without recalculating', async () => {
    // Pulse 240 would normally be calculated as "critically_high" (>= 230)
    // Temperature 41 would normally be calculated as "high" (> 37.5 but < 43)
    // SpO2 70 would normally be calculated as "critically_low" (< 95)
    // Respiratory Rate 5 would normally be calculated as "critically_low" (< 12)
    // Backend sends the interpretation for all vitals as "normal", except for Respiratory Rate which is "critically_low" (< 12)
    // It should use backend's interpretation and NOT recalculate
    const vitalsWithConflictingInterpretation: PatientVitalsAndBiometrics[] = [
      {
        id: '0',
        date: '2021-05-19T04:26:51.000Z',
        pulse: 240,
        temperature: 41,
        respiratoryRate: 5,
        diastolic: 145,
        systolic: 240,
        spo2: 70,
        diastolicRenderInterpretation: 'normal',
        systolicRenderInterpretation: 'normal',
        bloodPressureRenderInterpretation: 'normal',
        pulseRenderInterpretation: 'normal',
        temperatureRenderInterpretation: 'normal',
        respiratoryRateRenderInterpretation: 'critically_low',
        spo2RenderInterpretation: 'normal',
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsWithConflictingInterpretation,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(getByTextWithMarkup(/BP\s*240 \/ 145\s*mmHg/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Heart rate\s*240\s*beats\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Temp\s*41\s*DEG C/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/R\. Rate\s*5\s*breaths\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/SpO2\s*70\s*/i)).toBeInTheDocument();

    expect(screen.getAllByTitle(/abnormal value/i)).toHaveLength(1);
    expect(screen.getByTitle(/abnormal value/i)).toHaveClass('critically-low');
  });

  it('recalculates interpretation when backend does not provide interpretation', async () => {
    // All vitals are abnormal, and backend does not provide interpretation for any of them.
    // It should fallback to recalculating and mark them as abnormal.
    const vitalsWithoutInterpretation: PatientVitalsAndBiometrics[] = [
      {
        id: '0',
        date: '2021-05-19T04:26:51.000Z',
        pulse: 240, // should be marked as "critically_high"
        temperature: 41, // should be marked as "high"
        respiratoryRate: 5, // should be marked as "low"
        diastolic: 145,
        systolic: 240, // blood pressure should be marked as "high"
        spo2: 70, // should be marked as "low"
      },
    ];

    mockUseVitalsAndBiometrics.mockReturnValue({
      data: vitalsWithoutInterpretation,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    expect(getByTextWithMarkup(/BP\s*240 \/ 145\s*mmHg/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Heart rate\s*240\s*beats\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/Temp\s*41\s*DEG C/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/R\. Rate\s*5\s*breaths\/min/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/SpO2\s*70\s*/i)).toBeInTheDocument();

    const abnormalValueElements = screen.getAllByTitle(/abnormal value/i);
    expect(abnormalValueElements).toHaveLength(5);

    const lowElements = abnormalValueElements.filter((element) => {
      return element.className === 'low';
    });
    expect(lowElements).toHaveLength(2);

    const highElements = abnormalValueElements.filter((element) => {
      return element.className === 'high';
    });
    expect(highElements).toHaveLength(2);

    const criticallyHighElements = abnormalValueElements.filter((element) => {
      return element.className === 'critically-high';
    });
    expect(criticallyHighElements).toHaveLength(1);
  });
});
