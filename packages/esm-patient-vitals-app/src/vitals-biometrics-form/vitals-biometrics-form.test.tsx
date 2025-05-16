import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, showSnackbar, useConfig, getDefaultsFromConfigSchema } from '@openmrs/esm-framework';
import { createOrUpdateVitalsAndBiometrics, useEncounterVitalsAndBiometrics } from '../common';
import { type ConfigObject, configSchema } from '../config-schema';
import { mockConceptUnits, mockCurrentVisit, mockVitalsConceptMetadata, mockVitalsConfig } from '__mocks__';
import { mockPatient } from 'tools';
import VitalsAndBiometricsForm from './vitals-biometrics-form.workspace';

const heightValue = 180;
const muacValue = 23;
const oxygenSaturationValue = 100;
const pulseValue = 80;
const respiratoryRateValue = 16;
const weightValue = 62;
const systolicBloodPressureValue = 120;
const temperatureValue = 37;

const testProps = {
  closeWorkspace: () => {},
  closeWorkspaceWithSavedChanges: jest.fn(),
  patientUuid: mockPatient.id,
  patient: mockPatient,
  promptBeforeClosing: () => {},
  formContext: 'creating' as 'creating' | 'editing',
  setTitle: jest.fn(),
};

const mockShowSnackbar = jest.mocked(showSnackbar);
const mockCreateOrUpdateVitalsAndBiometrics = jest.mocked(createOrUpdateVitalsAndBiometrics);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseEncounterVitalsAndBiometrics = jest.mocked(useEncounterVitalsAndBiometrics);

jest.mock('../common', () => ({
  assessValue: jest.fn(),
  getReferenceRangesForConcept: jest.fn(),
  generatePlaceholder: jest.fn(),
  interpretBloodPressure: jest.fn(),
  invalidateCachedVitalsAndBiometrics: jest.fn(),
  createOrUpdateVitalsAndBiometrics: jest.fn(),
  useVitalsAndBiometrics: jest.fn(),
  useConceptUnits: jest.fn().mockImplementation(() => ({
    conceptUnits: mockConceptUnits,
    error: null,
    isLoading: false,
  })),
  useEncounterVitalsAndBiometrics: jest.fn().mockImplementation(() => ({
    isLoading: false,
    vitalsAndBiometrics: null,
    mutate: jest.fn(),
  })),
  useVitalsConceptMetadata: jest.fn().mockImplementation(() => mockVitalsConceptMetadata),
}));

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  ...mockVitalsConfig,
});

function setupMockUseEncounterVitalsAndBiometrics() {
  mockUseEncounterVitalsAndBiometrics.mockReturnValue({
    isLoading: false,
    vitalsAndBiometrics: new Map([
      [
        'systolicBloodPressure',
        {
          value: 120,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174001', display: 'Systolic Blood Pressure: 120' },
        },
      ],
      [
        'diastolicBloodPressure',
        {
          value: 80,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174002', display: 'Diastolic Blood Pressure: 80' },
        },
      ],
      [
        'pulse',
        {
          value: 75,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174003', display: 'Pulse Rate: 75' },
        },
      ],
      [
        'temperature',
        {
          value: 36.5,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174004', display: 'Body Temperature: 36.5°C' },
        },
      ],
      [
        'oxygenSaturation',
        {
          value: 98,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174005', display: 'Oxygen Saturation: 98%' },
        },
      ],
      [
        'height',
        {
          value: 170,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174006', display: 'Height: 170 cm' },
        },
      ],
      [
        'weight',
        {
          value: 65,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174007', display: 'Weight: 65 kg' },
        },
      ],
      [
        'respiratoryRate',
        {
          value: 16,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174008', display: 'Respiratory Rate: 16 breaths/min' },
        },
      ],
      [
        'midUpperArmCircumference',
        {
          value: 25,
          obs: { uuid: '123e4567-e89b-12d3-a456-426614174009', display: 'Mid-Upper Arm Circumference: 25 cm' },
        },
      ],
    ]),
    encounter: null,
    error: null,
    mutate: jest.fn(),
    getRefinedInitialValues: () => ({
      height: 170,
      weight: 65,
      systolicBloodPressure: 120,
      diastolicBloodPressure: 80,
      pulse: 75,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      temperature: 36.5,
      midUpperArmCircumference: 25,
    }),
  });
}

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return {
    ...originalModule,
    usePatientChartStore: () => ({
      visits: {
        activeVisit: mockCurrentVisit,
        currentVisit: mockCurrentVisit,
        currentVisitIsRetrospective: false,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: null,
      },
    }),
  };
});

describe('VitalsBiometricsForm', () => {
  it('renders the vitals and biometrics form', async () => {
    render(<VitalsAndBiometricsForm {...testProps} />);

    expect(screen.getByText(/vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/blood pressure/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /systolic/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /diastolic/i })).toBeInTheDocument();
    expect(screen.getByText(/mmHg/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByText(/beats\/min/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /oxygen saturation/i })).toBeInTheDocument();
    expect(screen.getByText(/spO2/i)).toBeInTheDocument();
    expect(screen.getByText(/%/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /respiration rate/i })).toBeInTheDocument();
    expect(screen.getByText(/breaths\/min/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /temperature/i })).toBeInTheDocument();
    expect(screen.getByText(/temp/i)).toBeInTheDocument();
    expect(screen.getByText(/DEG C/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type any additional notes here/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByText(/^kg$/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByText(/bmi \(calc.\)/i)).toBeInTheDocument();
    expect(screen.getByText(/kg \/ m²/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /muac/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
  });

  it("computes a patient's BMI from the given height and weight values", async () => {
    const user = userEvent.setup();

    render(<VitalsAndBiometricsForm {...testProps} />);

    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const bmiInput = screen.getByRole('spinbutton', { name: /bmi/i });

    await user.type(heightInput, '180');
    await user.type(weightInput, '62');

    expect(bmiInput).toHaveValue(19.1);
  });

  it('renders a success snackbar upon clicking the save button', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'created',
      status: 201,
      data: [],
    };

    mockCreateOrUpdateVitalsAndBiometrics.mockResolvedValue(
      response as ReturnType<typeof createOrUpdateVitalsAndBiometrics>,
    );

    render(<VitalsAndBiometricsForm {...testProps} />);

    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const bmiInput = screen.getByRole('spinbutton', { name: /bmi/i });
    const systolic = screen.getByRole('spinbutton', { name: /systolic/i });
    const pulse = screen.getByRole('spinbutton', { name: /pulse/i });
    const oxygenSaturation = screen.getByRole('spinbutton', { name: /oxygen saturation/i });
    const respirationRate = screen.getByRole('spinbutton', { name: /respiration rate/i });
    const temperature = screen.getByRole('spinbutton', { name: /temperature/i });
    const muac = screen.getByRole('spinbutton', { name: /muac/i });
    const saveButton = screen.getByRole('button', { name: /Save and close/i });

    await user.type(heightInput, heightValue.toString());
    await user.type(weightInput, weightValue.toString());
    await user.type(systolic, systolicBloodPressureValue.toString());
    await user.type(pulse, pulseValue.toString());
    await user.type(oxygenSaturation, oxygenSaturationValue.toString());
    await user.type(respirationRate, respiratoryRateValue.toString());
    await user.type(temperature, temperatureValue.toString());
    await user.type(muac, muacValue.toString());

    expect(bmiInput).toHaveValue(19.1);
    expect(systolic).toHaveValue(120);
    expect(pulse).toHaveValue(80);
    expect(oxygenSaturation).toHaveValue(100);
    expect(respirationRate).toHaveValue(16);
    expect(temperature).toHaveValue(37);
    expect(muac).toHaveValue(23);

    await user.click(saveButton);

    expect(mockCreateOrUpdateVitalsAndBiometrics).toHaveBeenCalledTimes(1);
    expect(mockCreateOrUpdateVitalsAndBiometrics).toHaveBeenCalledWith(
      mockPatient.id,
      mockVitalsConfig.vitals.encounterTypeUuid,
      undefined,
      undefined,
      expect.arrayContaining([
        { concept: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 120 },
        { concept: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 16 },
        { concept: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 100 },
        { concept: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 80 },
        { concept: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 37 },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 62 },
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 180 },
        { concept: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 23 },
      ]),
      expect.objectContaining({
        signal: {
          aborted: false,
        },
        abort: expect.any(Function),
      }),
    );

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        isLowContrast: true,
        kind: 'success',
        subtitle: 'They are now visible on the Vitals and Biometrics page',
        title: 'Vitals and Biometrics saved',
      }),
    );
  });

  it('correctly initializes the form with existing vitals and biometrics data while in edit mode', async () => {
    setupMockUseEncounterVitalsAndBiometrics();
    render(<VitalsAndBiometricsForm {...testProps} formContext="editing" editEncounterUuid="encounter-uuid" />);

    expect(screen.getByRole('spinbutton', { name: /height/i })).toHaveValue(170);
    expect(screen.getByRole('spinbutton', { name: /weight/i })).toHaveValue(65);
    expect(screen.getByRole('spinbutton', { name: /systolic/i })).toHaveValue(120);
    expect(screen.getByRole('spinbutton', { name: /diastolic/i })).toHaveValue(80);
    expect(screen.getByRole('spinbutton', { name: /pulse/i })).toHaveValue(75);
    expect(screen.getByRole('spinbutton', { name: /oxygen saturation/i })).toHaveValue(98);
    expect(screen.getByRole('spinbutton', { name: /respiration rate/i })).toHaveValue(16);
    expect(screen.getByRole('spinbutton', { name: /temperature/i })).toHaveValue(36.5);
    expect(screen.getByRole('spinbutton', { name: /muac/i })).toHaveValue(25);
  });

  it('edits patient vitals and biometrics', async () => {
    const user = userEvent.setup();
    setupMockUseEncounterVitalsAndBiometrics();

    const response: Partial<FetchResponse> = {
      statusText: 'created',
      status: 201,
      data: [],
    };

    mockCreateOrUpdateVitalsAndBiometrics.mockResolvedValue(
      response as ReturnType<typeof createOrUpdateVitalsAndBiometrics>,
    );

    render(<VitalsAndBiometricsForm {...testProps} formContext="editing" editEncounterUuid="encounter-uuid" />);

    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const systolicInput = screen.getByRole('spinbutton', { name: /systolic/i });
    const pulseInput = screen.getByRole('spinbutton', { name: /pulse/i });
    const temperatureInput = screen.getByRole('spinbutton', { name: /temperature/i });
    const saveButton = screen.getByRole('button', { name: /Save and close/i });

    // the save button should be disabled until the user makes a change
    expect(saveButton).toBeDisabled();
    await user.clear(weightInput);
    await user.type(weightInput, '70');
    await user.clear(systolicInput);
    await user.type(systolicInput, '130');
    await user.clear(temperatureInput);
    await user.type(temperatureInput, '37.5');
    // delete the pulse value
    await user.clear(pulseInput);

    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(mockCreateOrUpdateVitalsAndBiometrics).toHaveBeenCalledTimes(1);
    expect(mockCreateOrUpdateVitalsAndBiometrics).toHaveBeenCalledWith(
      mockPatient.id,
      mockVitalsConfig.vitals.encounterTypeUuid,
      'encounter-uuid',
      undefined,
      expect.arrayContaining([
        { concept: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 130 },
        { concept: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 37.5 },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 70 },
        { uuid: '123e4567-e89b-12d3-a456-426614174001', voided: true },
        { uuid: '123e4567-e89b-12d3-a456-426614174003', voided: true },
        { uuid: '123e4567-e89b-12d3-a456-426614174004', voided: true },
        { uuid: '123e4567-e89b-12d3-a456-426614174007', voided: true },
      ]),
      expect.objectContaining({
        signal: {
          aborted: false,
        },
        abort: expect.any(Function),
      }),
    );

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        isLowContrast: true,
        kind: 'success',
        subtitle: 'They are now visible on the Vitals and Biometrics page',
        title: 'Vitals and Biometrics updated',
      }),
    );
  });

  it('renders an error snackbar if there was a problem saving vitals and biometrics', async () => {
    const user = userEvent.setup();

    const error = {
      message: 'Some of the values entered are invalid',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockCreateOrUpdateVitalsAndBiometrics.mockRejectedValueOnce(error);

    render(<VitalsAndBiometricsForm {...testProps} />);

    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const systolic = screen.getByRole('spinbutton', { name: /systolic/i });
    const pulse = screen.getByRole('spinbutton', { name: /pulse/i });
    const oxygenSaturation = screen.getByRole('spinbutton', { name: /oxygen saturation/i });
    const respirationRate = screen.getByRole('spinbutton', { name: /respiration rate/i });
    const temperature = screen.getByRole('spinbutton', { name: /temperature/i });
    const muac = screen.getByRole('spinbutton', { name: /muac/i });

    await user.type(heightInput, heightValue.toString());
    await user.type(weightInput, weightValue.toString());
    await user.type(systolic, systolicBloodPressureValue.toString());
    await user.type(pulse, pulseValue.toString());
    await user.type(oxygenSaturation, oxygenSaturationValue.toString());
    await user.type(respirationRate, respiratoryRateValue.toString());
    await user.type(temperature, temperatureValue.toString());
    await user.type(muac, muacValue.toString());

    const saveButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(saveButton);

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      subtitle: 'Some of the values entered are invalid',
      title: 'Error saving Vitals and Biometrics',
    });
  });
});
