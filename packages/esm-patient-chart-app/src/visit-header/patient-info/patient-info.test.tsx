import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientInfo from './patient-info.component';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn().mockReturnValue('tablet'),
  ...jest.requireActual('@openmrs/esm-framework'),
}));

describe('PatientInfo component', () => {
  const patientData = {
    name: [
      {
        given: ['John'],
        family: 'Doe',
      },
    ],
    birthDate: '1990-01-01',
    gender: 'male',
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should render patient name and information', () => {
    render(<PatientInfo patient={patientData} />);

    // Check if the patient's name and information are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('33, Male')).toBeInTheDocument();
  });

  test('should truncate long patient name and show a tooltip', () => {
    // Create a long name
    const longNamePatient = {
      ...patientData,
      name: [{ given: ['ThisIsALongNameThatWillBeTruncated'], family: 'LastName' }],
    };

    render(<PatientInfo patient={longNamePatient} />);

    const toolTipButton = screen.getByRole('button');
    expect(toolTipButton).toBeInTheDocument();
    expect(toolTipButton).toHaveTextContent('ThisIsALongNameThatWillBe...');
    expect(screen.getByText('33, Male')).toBeInTheDocument();
  });
});
