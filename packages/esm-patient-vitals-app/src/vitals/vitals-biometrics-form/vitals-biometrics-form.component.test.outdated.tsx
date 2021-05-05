import React from 'react';
import userEvent from '@testing-library/user-event';
import VitalsAndBiometricForms from './vitals-biometrics-form.component';
import { screen, render, act } from '@testing-library/react';
import { savePatientVitals } from '../vitals-biometrics.resource';
import { mockSessionDataResponse } from '../../../../../__mocks__/session.mock';
import { mockVitalsSignsConcept } from '../../../../../__mocks__/vitals.mock';
import { openmrsObservableFetch, openmrsFetch } from '@openmrs/esm-framework';
import { of } from 'rxjs';

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockSavePatientVitals = savePatientVitals as jest.Mock;
const mockCloseWorkspace = jest.fn();

mockOpenmrsObservableFetch.mockImplementation(jest.fn());
mockOpenmrsFetch.mockImplementation(jest.fn());

jest.mock('../vitals-biometrics.resource', () => ({
  savePatientVitals: jest.fn(),
}));

window.getOpenmrsSpaBase = jest.fn();
describe('<VitalsBiometricsForm/>', () => {
  const mockVitalsBiometricsFormProps = { closeworkSpace: mockCloseWorkspace };
  const promise = Promise.resolve(mockVitalsSignsConcept);
  beforeEach(async () => {
    mockOpenmrsObservableFetch.mockImplementation(() => of(mockSessionDataResponse));
    mockOpenmrsFetch.mockImplementation((url: string, config: { method: string; body: any }) => {
      if (url.indexOf('?q=VITALS SIGN') >= 0) return promise;
    });
    render(<VitalsAndBiometricForms closeWorkspace={mockVitalsBiometricsFormProps.closeworkSpace} />);
    await act(() => promise);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should close form when cancel button is clicked', async () => {
    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    userEvent.click(cancelButton);
    expect(mockCloseWorkspace).toHaveBeenCalledTimes(1);
  });

  it('should save patient vitals and biometrics and close form', async () => {
    const saveButton = screen.getByRole('button', { name: /Sign & Save/i });
    userEvent.type(screen.getByTitle(/systolic/i), '120');
    userEvent.type(screen.getByTitle(/diastolic/i), '80');
    userEvent.type(screen.getByTitle(/pulse/i), '29');
    userEvent.type(screen.getByTitle(/Oxygen Saturation/i), '93');
    userEvent.type(screen.getByTitle(/Respiration Rate/i), '70');
    userEvent.type(screen.getByTitle(/Temperature/i), '36.5');
    userEvent.type(screen.getByTitle(/Notes/i), '55');
    userEvent.type(screen.getByTitle(/Weight/i), '70');
    userEvent.type(screen.getByTitle(/Height/i), '165');
    userEvent.type(screen.getByTitle(/MUAC/i), '28');

    const bmi = screen.getByTitle(/bmi/);
    expect(bmi).toHaveValue('25.7');
    expect(bmi).toHaveClass('danger');

    mockSavePatientVitals.mockImplementation(() => Promise.resolve({ status: 201 }));
    userEvent.click(saveButton);

    expect(mockSavePatientVitals).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      {
        diastolicBloodPressure: '80',
        generalPatientNote: '55',
        height: '165',
        midUpperArmCircumference: '28',
        oxygenSaturation: '93',
        pulse: '29',
        respiratoryRate: '70',
        systolicBloodPressure: '120',
        temperature: '36.5',
        weight: '70',
      },
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });
});
