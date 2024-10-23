import React from 'react';
import dayjs from 'dayjs';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type WorkspacesInfo, getDefaultsFromConfigSchema, useConfig, useWorkspaces } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient, getByTextWithMarkup, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockVitalsConfig, mockCurrentVisit, mockConceptUnits, mockConceptMetadata, formattedVitals } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useVitalsAndBiometrics } from '../common';
import VitalsHeader from './vitals-header.component';

const testProps = {
  patientUuid: mockPatient.id,
  showRecordVitalsButton: true,
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockLaunchPatientWorkspace = jest.mocked(launchPatientWorkspace);
const mockUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockUseWorkspaces = jest.mocked(useWorkspaces);

mockUseWorkspaces.mockReturnValue({ workspaces: [] } as WorkspacesInfo);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVisitOrOfflineVisit: jest.fn().mockImplementation(() => ({ currentVisit: mockCurrentVisit })),
  };
});

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
      data: formattedVitals,
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
    expect(getByTextWithMarkup(/these vitals are out of date/i)).toBeInTheDocument();
  });

  it('launches the vitals form when the `record vitals` button is clicked', async () => {
    const user = userEvent.setup();

    renderWithSwr(<VitalsHeader {...testProps} />);

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await user.click(recordVitalsButton);

    expect(mockLaunchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith(patientVitalsBiometricsFormWorkspace);
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

    // TODO: Fix pluralization so that the string reads "5 days old"
    expect(getByTextWithMarkup(/These vitals are 5 day old/i)).toBeInTheDocument();
  });

  it('does not flag normal values that lie within the provided reference ranges', async () => {
    mockUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
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

    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: {
        encounterUuid: '',
        formUuid: '9f26aad4-244a-46ca-be49-1196df1a8c9a',
      },
      workspaceTitle: 'Triage',
    });
  });
});
