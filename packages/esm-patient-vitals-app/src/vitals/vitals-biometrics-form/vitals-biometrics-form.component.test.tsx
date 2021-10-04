import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { mockConceptMetadata, mockConceptUnits, mockVitalsConfig } from '../../../../../__mocks__/vitals.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import VitalsAndBiometricsForm from './vitals-biometrics-form.component';

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: {
        conceptUnits: mockConceptUnits,
        conceptMetadata: mockConceptMetadata,
      },
    })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(() => mockVitalsConfig),
  };
});

jest.mock('../vitals.resource', () => ({
  savePatientVitals: jest.fn(),
}));

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: () => {},
  isTablet: false,
};

describe('VitalsBiometricsForm: ', () => {
  it('renders the vitals and biometrics form', async () => {
    renderForm();

    expect(screen.getByText(/vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/blood pressure/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /systolic/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /diastolic/i })).toBeInTheDocument();
    expect(screen.getByText(/mmHg/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByText(/beats\/min/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /oxygen saturation/i })).toBeInTheDocument();
    expect(screen.getByText(/spO2/i)).toBeInTheDocument();
    expect(screen.getByText(/%/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /respiration rate/i })).toBeInTheDocument();
    expect(screen.getByText(/breaths\/min/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /temperature/i })).toBeInTheDocument();
    expect(screen.getByText(/temp/i)).toBeInTheDocument();
    expect(screen.getByText(/deg c/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type any additional notes here/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByText(/^kg$/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByText(/bmi \(calc.\)/i)).toBeInTheDocument();
    expect(screen.getByText(/kg \/ m²/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /muac/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign & save/i })).toBeInTheDocument();
  });

  it('computes BMI from the given height and weight values', async () => {
    renderForm();

    const heightInput = screen.getByRole('textbox', { name: /height/i });
    const weightInput = screen.getByRole('textbox', { name: /weight/i });
    const bmiInput = screen.getByRole('textbox', { name: /bmi/i });

    userEvent.type(heightInput, '180');
    userEvent.type(weightInput, '62');

    expect(bmiInput).toHaveValue('19.1');
  });
});

function renderForm() {
  render(<VitalsAndBiometricsForm {...testProps} />);
}
