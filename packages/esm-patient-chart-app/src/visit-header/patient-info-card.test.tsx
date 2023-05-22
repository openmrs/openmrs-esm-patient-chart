import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientInfoCard from './patient-info-card.component';
import { age, useLayoutType } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  age: jest.fn(),
  useLayoutType: jest.fn(),
}));

describe('PatientInfoCard', () => {
  const mockPatientMale = {
    name: [{ given: ['John'], family: 'Doe' }],
    birthDate: '1990-01-01',
    gender: 'male',
  };

  const mockPatientFemale = {
    ...mockPatientMale,
    gender: 'female',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders male patient correctly', () => {
    age.mockReturnValue(33);
    useLayoutType.mockReturnValue('desktop');

    const { getByText } = render(<PatientInfoCard patient={mockPatientMale} />);

    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('33, Male')).toBeInTheDocument();
  });

  it('renders female patient correctly', () => {
    age.mockReturnValue(33);
    useLayoutType.mockReturnValue('desktop');

    const { getByText } = render(<PatientInfoCard patient={mockPatientFemale} />);

    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('33, Female')).toBeInTheDocument();
  });

  it('truncates long names on non-tablet layouts', () => {
    age.mockReturnValue(33);
    useLayoutType.mockReturnValue('desktop');

    const longNamePatient = {
      ...mockPatientMale,
      name: [{ given: ['Long', 'Name'], family: 'VeryLongLastName' }],
    };

    render(<PatientInfoCard patient={longNamePatient} />);

    expect(screen.getByText('Long Name VeryLongLastNam...', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('33, Male')).toBeInTheDocument();
  });

  it('renders null when no patient is provided', () => {
    const { container } = render(<PatientInfoCard patient={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
