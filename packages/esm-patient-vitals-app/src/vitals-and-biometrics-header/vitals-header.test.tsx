import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type WorkspacesInfo,
  defineConfigSchema,
  getDefaultsFromConfigSchema,
  useConfig,
  useWorkspaces,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient, getByTextWithMarkup, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockVitalsConfig, mockCurrentVisit, mockConceptUnits, mockConceptMetadata, formattedVitals } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useVitalsAndBiometrics } from '../common';
import VitalsHeader from './vitals-header.component';

defineConfigSchema('@openmrs/esm-patient-vitals-app', configSchema);

const mockedUseConfig = jest.mocked(useConfig);
const mockedLaunchPatientWorkspace = jest.mocked(launchPatientWorkspace);
const mockedUseVitalsAndBiometrics = jest.mocked(useVitalsAndBiometrics);
const mockedUseWorkspaces = jest.mocked(useWorkspaces);

mockedUseWorkspaces.mockReturnValue({ workspaces: [] } as WorkspacesInfo);

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

describe('VitalsHeader: ', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      mockVitalsConfig,
    });
    jest.clearAllMocks();
  });

  it('renders an empty state view when there are no vitals data to show', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: [],
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.getByText(/vitals and biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/no data has been recorded for this patient/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record vitals/i })).toBeInTheDocument();
  });

  it('renders the most recently recorded values in the vitals header', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsHeader();

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

    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('launches the vitals form when the `record vitals` button is clicked', async () => {
    const user = userEvent.setup();

    renderVitalsHeader();

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await user.click(recordVitalsButton);

    expect(mockedLaunchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(mockedLaunchPatientWorkspace).toHaveBeenCalledWith(patientVitalsBiometricsFormWorkspace);
  });

  it('does not flag normal values that lie within the provided reference ranges', async () => {
    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: formattedVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsHeader();

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

    mockedUseVitalsAndBiometrics.mockReturnValue({
      data: abnormalVitals,
    } as ReturnType<typeof useVitalsAndBiometrics>);

    renderVitalsHeader();

    await waitForLoadingToFinish();

    expect(screen.queryByTitle(/abnormal value/i)).toBeInTheDocument();
  });

  it('should launch Form Entry vitals and biometrics form', async () => {
    const user = userEvent.setup();

    mockedUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      vitals: { ...mockVitalsConfig.vitals, useFormEngine: true, formName: 'Triage' },
    });

    renderVitalsHeader();

    await waitForLoadingToFinish();

    const recordVitalsButton = screen.getByText(/Record vitals/i);

    await user.click(recordVitalsButton);

    expect(mockedLaunchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: {
        encounterUuid: '',
        formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
      },
      workspaceTitle: 'Triage',
    });
  });
});

function renderVitalsHeader() {
  const testProps = {
    patientUuid: mockPatient.id,
    showRecordVitalsButton: true,
  };

  renderWithSwr(<VitalsHeader {...testProps} />);
}
