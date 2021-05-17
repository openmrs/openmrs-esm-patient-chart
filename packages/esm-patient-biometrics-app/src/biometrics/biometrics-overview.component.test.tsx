import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BiometricOverview from './biometrics-overview.component';
import * as mockOpenmrsFramework from '@openmrs/esm-framework/mock';
import * as mockBiometricsAPI from './biometric.resource';
import * as mockConceptMetaData from './use-vitalsigns';
import { of } from 'rxjs';
import { attach } from '@openmrs/esm-framework';

const mockAttach = attach as jest.Mock;

describe('<Biometric/>', () => {
  const mockBiometricsConfig = {
    biometrics: { bmiUnit: 'kg / m²' },
    concepts: { weightUuid: '5089', heighUuid: '5090' },
  };
  const mockConceptsUnits = {
    conceptsUnits: ['mmHg', '%', 'breather/min', 'cm', 'Kg'],
  };
  const mockBiometrics = [
    {
      id: 'bca4d5f1-ee6a-4282-a5ff-c8db12c4247c',
      weight: 65,
      height: 185,
      date: '27-Nov 12:06 PM',
      bmi: '24.8',
    },
    {
      id: '1ca4d5f1-ee6a-4282-a5ff-c8db12c4247c',
      weight: 100,
      height: 180,
      date: '28-Nov 12:06 PM',
      bmi: '25.8',
    },
  ];

  const renderBiometrics = () => {
    spyOn(mockOpenmrsFramework, 'useConfig').and.returnValue(mockBiometricsConfig);
    spyOn(mockBiometricsAPI, 'getPatientBiometrics').and.returnValue(of(mockBiometrics));
    spyOn(mockConceptMetaData, 'useVitalsSignsConceptMetaData').and.returnValue(mockConceptsUnits);
    render(<BiometricOverview showAddBiometrics={true} patientUuid="8673ee4f-e2ab-4077-ba55-4980f408773e1" />);
  };

  const renderEmptyBiometrics = () => {
    spyOn(mockOpenmrsFramework, 'useConfig').and.returnValue(mockBiometricsConfig);
    spyOn(mockBiometricsAPI, 'getPatientBiometrics').and.returnValue(of([]));
    spyOn(mockConceptMetaData, 'useVitalsSignsConceptMetaData').and.returnValue(mockConceptsUnits);
    render(<BiometricOverview showAddBiometrics={true} patientUuid="8673ee4f-e2ab-4077-ba55-4980f408773e1" />);
  };

  const renderErrorStateBiometrics = () => {
    spyOn(mockOpenmrsFramework, 'useConfig').and.returnValue(mockBiometricsConfig);
    spyOn(mockOpenmrsFramework, 'openmrsObservableFetch').and.callFake(() => of(new Error()));
    spyOn(mockConceptMetaData, 'useVitalsSignsConceptMetaData').and.returnValue(mockConceptsUnits);
    render(<BiometricOverview showAddBiometrics={true} patientUuid="8673ee4f-e2ab-4077-ba55-4980f408773e1" />);
  };

  it('should render patient biometrics', () => {
    renderBiometrics();
    expect(screen.getByRole('heading', { name: /Biometrics/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/27 - Nov - 2001/i)).toBeInTheDocument();
    expect(screen.getByText(/65/i)).toBeInTheDocument();
    expect(screen.getByText(/185/i)).toBeInTheDocument();
    expect(screen.getByText(/24.8/i)).toBeInTheDocument();
    expect(screen.getByText('Height (cm)')).toBeInTheDocument();
    expect(screen.getByText('Weight (Kg)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Table View/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chart View/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
  });

  it('should launch biometrics form', () => {
    renderBiometrics();
    const launchBiometricsFormButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(launchBiometricsFormButton);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'patient-vitals-biometrics-form-workspace');
  });

  it('should display empty biometrics', () => {
    renderEmptyBiometrics();
    expect(screen.getByRole('heading', { name: /Biometrics/i })).toBeInTheDocument();
    expect(screen.getByText(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/Record biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no biometrics to display for this patient/i)).toBeInTheDocument();
    const launchBiometricsForm = screen.getByText(/Record biometrics/i);
    fireEvent.click(launchBiometricsForm);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'patient-vitals-biometrics-form-workspace');
  });

  it('should display an error message', () => {
    renderErrorStateBiometrics();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/)).toBeInTheDocument();
  });

  it('should toggle between chart and table view', () => {
    renderBiometrics();
    const chartViewButton = screen.getByRole('button', { name: /Chart View/i });
    fireEvent.click(chartViewButton);
    expect(screen.getByRole('radio', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /BMI/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /BMI/i }));
    expect(screen.getByRole('radio', { name: /BMI/i })).toHaveProperty('checked');
    const tableViewButton = screen.getByRole('button', { name: /Table View/i });
    fireEvent.click(tableViewButton);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
