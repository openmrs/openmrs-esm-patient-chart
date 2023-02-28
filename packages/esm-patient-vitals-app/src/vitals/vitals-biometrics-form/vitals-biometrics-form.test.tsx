import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { mockConceptMetadata, mockVitalsConfig, mockVitalsSignsConcept } from '../../../../../__mocks__/vitals.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import VitalsAndBiometricsForm from './vitals-biometrics-form.component';
import { savePatientVitals } from '../vitals.resource';

const testProps = {
  closeWorkspace: () => {},
  patientUuid: mockPatient.id,
  promptBeforeClosing: () => {},
};

const mockShowToast = showToast as jest.Mock;
const mockSavePatientVitals = savePatientVitals as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;

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

jest.mock('../vitals.resource', () => ({
  savePatientVitals: jest.fn(),
  useVitals: jest.fn().mockImplementation(() => ({
    mutate: jest.fn,
  })),
}));

describe('VitalsBiometricsForm: ', () => {
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
    // @ts-ignore
    jest.useFakeTimers('modern');
    // @ts-ignore
    jest.setSystemTime(1638682781000); // 5 Dec 2021 05:39:41 GMT

    const user = userEvent.setup();

    mockSavePatientVitals.mockResolvedValueOnce({ status: 201, statusText: 'Ok' });

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

    await waitFor(() => user.type(heightInput, '180'));
    await waitFor(() => user.type(weightInput, '62'));
    await waitFor(() => user.type(systolic, '120'));
    await waitFor(() => user.type(pulse, '80'));
    await waitFor(() => user.type(oxygenSaturation, '100'));
    await waitFor(() => user.type(respirationRate, '16'));
    await waitFor(() => user.type(temperature, '37'));
    await waitFor(() => user.type(muac, '23'));

    expect(bmiInput).toHaveValue(19.1);
    expect(systolic).toHaveValue(120);
    expect(pulse).toHaveValue(80);
    expect(oxygenSaturation).toHaveValue(100);
    expect(respirationRate).toHaveValue(16);
    expect(temperature).toHaveValue(37);
    expect(muac).toHaveValue(23);

    await waitFor(() => user.click(saveButton));

    expect(mockSavePatientVitals).toHaveBeenCalledTimes(1);
    expect(mockSavePatientVitals).toHaveBeenCalledWith(
      mockVitalsConfig.vitals.encounterTypeUuid,
      mockVitalsConfig.vitals.formUuid,
      mockVitalsConfig.concepts,
      mockPatient.id,
      expect.objectContaining({
        height: '180',
        midUpperArmCircumference: '23',
        oxygenSaturation: '100',
        pulse: '80',
        respiratoryRate: '16',
        systolicBloodPressure: '120',
        temperature: '37',
        weight: '62',
      }),
      expect.anything(),
      new AbortController(),
      undefined,
    );

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        critical: true,
        description: 'They are now visible on the Vitals and Biometrics page',
        kind: 'success',
        title: 'Vitals and Biometrics saved',
      }),
    );
  });

  it('renders an error notification if there was a problem saving vital biometrics', async () => {
    const user = userEvent.setup();

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Some of the values entered are invalid',
      },
    };

    mockSavePatientVitals.mockRejectedValueOnce(error);

    renderForm();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });

    await waitFor(() => user.click(saveButton));

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error saving vitals and biometrics',
    });
  });
});

function renderForm() {
  render(<VitalsAndBiometricsForm {...testProps} />);
}
