import React from 'react';
import userEvent from '@testing-library/user-event';
import VitalsAndBiometricForms from './vitals-biometrics-form.component';
import { screen, render } from '@testing-library/react';
import { savePatientVitals } from '../vitals-biometrics.resource';
import { mockSessionDataResponse } from '../../../../../__mocks__/session.mock';
import { mockConceptsUnits, mockVitalsConfig } from '../../../../../__mocks__/vitals.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import * as mockOpenmrsFramework from '@openmrs/esm-framework';
import { of } from 'rxjs';
import * as mockUseVitalSigns from './use-vitalsigns';

const mockSavePatientVitals = savePatientVitals as jest.Mock;
const mockCloseWorkspace = jest.fn();

jest.mock('../vitals-biometrics.resource', () => ({
  savePatientVitals: jest.fn(),
}));

describe('<VitalsBiometricsForm/>', () => {
  afterEach(() => jest.restoreAllMocks());

  const renderForm = () => {
    spyOn(mockUseVitalSigns, 'useVitalsSignsConceptMetaData').and.returnValue(mockConceptsUnits);
    spyOn(mockOpenmrsFramework, 'useConfig').and.returnValue(mockVitalsConfig);
    spyOn(mockOpenmrsFramework, 'useSessionUser').and.returnValue(of(mockSessionDataResponse));
    render(<VitalsAndBiometricForms closeWorkspace={mockCloseWorkspace} patientUuid={mockPatient.id} />);
  };

  it('should close form when cancel button is clicked', async () => {
    renderForm();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    userEvent.click(cancelButton);
    expect(mockCloseWorkspace).toHaveBeenCalledTimes(1);
  });

  it('should save patient vitals and biometrics and close form', async () => {
    renderForm();
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

    const bmi = screen.getByTitle(/BMI/i);
    expect(bmi).toHaveValue('25.7');
    expect(bmi).toHaveClass('danger');

    mockSavePatientVitals.mockImplementation(() => Promise.resolve({ status: 201 }));
    userEvent.click(saveButton);

    expect(mockSavePatientVitals).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
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
      new AbortController(),
      undefined,
    );
  });
});
