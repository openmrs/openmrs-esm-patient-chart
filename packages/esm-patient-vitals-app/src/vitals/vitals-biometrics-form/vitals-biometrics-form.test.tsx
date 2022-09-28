import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, act } from '@testing-library/react';
import { mockConceptMetadata, mockVitalsConfig, mockVitalsSignsConcept } from '../../../../../__mocks__/vitals.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import VitalsAndBiometricsForm from './vitals-biometrics-form.component';
import { showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { savePatientVitals } from '../vitals.resource';

const mockShowToast = showToast as jest.Mock;
const mockSavePatientVitals = savePatientVitals as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockedUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
    })),
  };
});

jest.mock('../vitals.resource', () => ({
  savePatientVitals: jest.fn(),
}));

const testProps = {
  closeWorkspace: () => {},
  patientUuid: mockPatient.id,
  promptBeforeClosing: () => {},
};

describe('VitalsBiometricsForm: ', () => {
  beforeEach(() => mockedUseConfig.mockReturnValue(mockVitalsConfig));

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

  it('computes BMI from the given height and weight values', async () => {
    renderForm();

    const heightInput = screen.getByRole('spinbutton', { name: /height/i });
    const weightInput = screen.getByRole('spinbutton', { name: /weight/i });
    const bmiInput = screen.getByRole('spinbutton', { name: /bmi/i });

    userEvent.type(heightInput, '180');
    userEvent.type(weightInput, '62');

    expect(bmiInput).toHaveValue(19.1);
  });

  describe('Vital-Biometrics Form submission', () => {
    let saveButton: HTMLElement;
    let muac: HTMLElement;
    let notes: HTMLElement;
    let temperature: HTMLElement;
    let respirationRate: HTMLElement;
    let oxygenSaturation: HTMLElement;
    let pulse: HTMLElement;
    let systolic: HTMLElement;
    let bmiInput: HTMLElement;
    let weightInput: HTMLElement;
    let heightInput: HTMLElement;

    beforeEach(async () => {
      // @ts-ignore
      jest.useFakeTimers('modern');
      // @ts-ignore
      jest.setSystemTime(1638682781000); // 5 Dec 2021 05:39:41 GMT

      renderForm();

      heightInput = screen.getByRole('spinbutton', { name: /height/i });
      weightInput = screen.getByRole('spinbutton', { name: /weight/i });
      bmiInput = screen.getByRole('spinbutton', { name: /bmi/i });
      systolic = screen.getByRole('spinbutton', { name: /systolic/i });
      pulse = screen.getByRole('spinbutton', { name: /pulse/i });
      oxygenSaturation = screen.getByRole('spinbutton', { name: /oxygen saturation/i });
      respirationRate = screen.getByRole('spinbutton', { name: /respiration rate/i });
      temperature = screen.getByRole('spinbutton', { name: /temperature/i });
      notes = screen.getByPlaceholderText(/type any additional notes here/i);
      muac = screen.getByRole('spinbutton', { name: /muac/i });
      saveButton = screen.getByRole('button', { name: /Save and close/i });
    });

    it('renders a success toast notification upon clicking the save button', async () => {
      const promise = Promise.resolve();
      mockSavePatientVitals.mockResolvedValueOnce({ status: 201, statusText: 'Ok' });

      userEvent.type(heightInput, '180');
      userEvent.type(weightInput, '62');
      userEvent.type(systolic, '120');
      userEvent.type(pulse, '80');
      userEvent.type(oxygenSaturation, '100');
      userEvent.type(respirationRate, '16');
      userEvent.type(temperature, '37');
      userEvent.type(notes, 'patient on MDR treatment');
      userEvent.type(muac, '23');

      expect(bmiInput).toHaveValue(19.1);
      expect(systolic).toHaveValue(120);
      expect(pulse).toHaveValue(80);
      expect(oxygenSaturation).toHaveValue(100);
      expect(respirationRate).toHaveValue(16);
      expect(temperature).toHaveValue(37);
      expect(notes).toHaveValue('patient on MDR treatment');
      expect(muac).toHaveValue(23);

      userEvent.click(saveButton);

      expect(mockSavePatientVitals).toHaveBeenCalledTimes(1);
      expect(mockSavePatientVitals).toHaveBeenCalledWith(
        '67a71486-1a54-468f-ac3e-7091a9a79584',
        'a000cb34-9ec1-4344-a1c8-f692232f6edd',
        {
          diastolicBloodPressureUuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          generalPatientNoteUuid: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          midUpperArmCircumferenceUuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          oxygenSaturationUuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          respiratoryRateUuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          systolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          temperatureUuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        '8673ee4f-e2ab-4077-ba55-4980f408773e',
        {
          generalPatientNote: 'patient on MDR treatment',
          height: '180',
          midUpperArmCircumference: '23',
          oxygenSaturation: '100',
          pulse: '80',
          respiratoryRate: '16',
          systolicBloodPressure: '120',
          temperature: '37',
          weight: '62',
        },
        new Date('2021-12-05T05:39:41.000Z'),
        new AbortController(),
        undefined,
      );

      await act(() => promise);

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
      const promise = Promise.resolve();

      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };
      mockSavePatientVitals.mockRejectedValueOnce(error);
      userEvent.type(temperature, '294')
      userEvent.clear(muac);
      userEvent.type(muac, 'on going');
      userEvent.clear(weightInput);
      userEvent.type(weightInput, '55');
      userEvent.click(saveButton);

      await act(() => promise);

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith({
        critical: true,
        description: 'Internal Server Error',
        kind: 'error',
        title: 'Error saving vitals and biometrics',
      });
    });
  });
});

function renderForm() {
  render(<VitalsAndBiometricsForm {...testProps} />);
}
