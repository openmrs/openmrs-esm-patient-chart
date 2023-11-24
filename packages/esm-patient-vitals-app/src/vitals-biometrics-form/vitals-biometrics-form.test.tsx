import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { mockConceptMetadata, mockVitalsConfig, mockVitalsSignsConcept } from '../__mocks__/vitals.mock';
import { mockPatient } from '../../../../tools/test-helpers';
import { saveVitalsAndBiometrics } from '../common';
import VitalsAndBiometricsForm from './vitals-biometrics-form.component';

const testProps = {
  closeWorkspace: () => {},
  patientUuid: mockPatient.id,
  promptBeforeClosing: () => {},
};

const heightValue = 180;
const muacValue = 23;
const oxygenSaturationValue = 100;
const pulseValue = 80;
const respiratoryRateValue = 16;
const weightValue = 62;
const systolicBloodPressureValue = 120;
const temperatureValue = 37;

const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedSavePatientVitals = jest.mocked(saveVitalsAndBiometrics);

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockConceptRanges = new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [
    concept.uuid,
    { lowAbsolute: concept.lowAbsolute ?? null, highAbsolute: concept.hiAbsolute ?? null },
  ]),
);

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockImplementation(() => mockVitalsConfig),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
      conceptRanges: mockConceptRanges,
    })),
  };
});

jest.mock('../common', () => ({
  assessValue: jest.fn(),
  getReferenceRangesForConcept: jest.fn(),
  generatePlaceholder: jest.fn(),
  interpretBloodPressure: jest.fn(),
  invalidateCachedVitalsAndBiometrics: jest.fn(),
  saveVitalsAndBiometrics: jest.fn(),
  useVitalsAndBiometrics: jest.fn(),
}));

describe('VitalsBiometricsForm', () => {
  beforeEach(() => {
    mockedShowSnackbar.mockClear();
  });

  it('renders the vitals and biometrics form', async () => {
    renderForm();

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

    renderForm();

    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const bmiInput = screen.getByRole('spinbutton', { name: /bmi/i });

    await waitFor(() => user.type(heightInput, '180'));
    await waitFor(() => user.type(weightInput, '62'));

    expect(bmiInput).toHaveValue(19.1);
  });

  it('renders a success toast notification upon clicking the save button', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'created',
      status: 201,
      data: [],
    };

    mockedSavePatientVitals.mockReturnValue(Promise.resolve(response) as ReturnType<typeof saveVitalsAndBiometrics>);

    renderForm();

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

    await waitFor(() => user.type(heightInput, heightValue.toString()));
    await waitFor(() => user.type(weightInput, weightValue.toString()));
    await waitFor(() => user.type(systolic, systolicBloodPressureValue.toString()));
    await waitFor(() => user.type(pulse, pulseValue.toString()));
    await waitFor(() => user.type(oxygenSaturation, oxygenSaturationValue.toString()));
    await waitFor(() => user.type(respirationRate, respiratoryRateValue.toString()));
    await waitFor(() => user.type(temperature, temperatureValue.toString()));
    await waitFor(() => user.type(muac, muacValue.toString()));

    expect(bmiInput).toHaveValue(19.1);
    expect(systolic).toHaveValue(120);
    expect(pulse).toHaveValue(80);
    expect(oxygenSaturation).toHaveValue(100);
    expect(respirationRate).toHaveValue(16);
    expect(temperature).toHaveValue(37);
    expect(muac).toHaveValue(23);

    await waitFor(() => user.click(saveButton));

    expect(mockedSavePatientVitals).toHaveBeenCalledTimes(1);
    expect(mockedSavePatientVitals).toHaveBeenCalledWith(
      mockVitalsConfig.vitals.encounterTypeUuid,
      mockVitalsConfig.vitals.formUuid,
      mockVitalsConfig.concepts,
      mockPatient.id,
      expect.objectContaining({
        height: heightValue,
        midUpperArmCircumference: muacValue,
        oxygenSaturation: oxygenSaturationValue,
        pulse: pulseValue,
        respiratoryRate: respiratoryRateValue,
        systolicBloodPressure: systolicBloodPressureValue,
        temperature: temperatureValue,
        weight: weightValue,
      }),
      expect.anything(),
      new AbortController(),
      undefined,
    );

    expect(mockedShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockedShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        isLowContrast: true,
        kind: 'success',
        subtitle: 'They are now visible on the Vitals and Biometrics page',
        title: 'Vitals and Biometrics saved',
      }),
    );
  });

  it('renders an error notification if there was a problem saving vitals and biometrics', async () => {
    const user = userEvent.setup();

    const error = {
      message: 'Some of the values entered are invalid',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockedSavePatientVitals.mockRejectedValueOnce(error);

    renderForm();
    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const systolic = screen.getByRole('spinbutton', { name: /systolic/i });
    const pulse = screen.getByRole('spinbutton', { name: /pulse/i });
    const oxygenSaturation = screen.getByRole('spinbutton', { name: /oxygen saturation/i });
    const respirationRate = screen.getByRole('spinbutton', { name: /respiration rate/i });
    const temperature = screen.getByRole('spinbutton', { name: /temperature/i });
    const muac = screen.getByRole('spinbutton', { name: /muac/i });

    await waitFor(() => user.type(heightInput, heightValue.toString()));
    await waitFor(() => user.type(weightInput, weightValue.toString()));
    await waitFor(() => user.type(systolic, systolicBloodPressureValue.toString()));
    await waitFor(() => user.type(pulse, pulseValue.toString()));
    await waitFor(() => user.type(oxygenSaturation, oxygenSaturationValue.toString()));
    await waitFor(() => user.type(respirationRate, respiratoryRateValue.toString()));
    await waitFor(() => user.type(temperature, temperatureValue.toString()));
    await waitFor(() => user.type(muac, muacValue.toString()));

    const saveButton = screen.getByRole('button', { name: /save and close/i });

    await waitFor(() => user.click(saveButton));

    expect(mockedShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      subtitle: 'Some of the values entered are invalid',
      title: 'Error saving vitals and biometrics',
    });
  });
});

function renderForm() {
  render(<VitalsAndBiometricsForm {...testProps} />);
}
