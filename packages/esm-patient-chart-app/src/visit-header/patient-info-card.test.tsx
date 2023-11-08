import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import PatientInfoCard from './patient-info-card.component';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    age: jest.fn().mockReturnValue('33'),
  };
});

const mockedUseLayoutType = jest.mocked(useLayoutType);

const malePatient = {
  name: [{ given: ['John'], family: 'Doe' }],
  birthDate: '1990-01-01',
  gender: 'male',
};

const malePatientWithALongName = {
  ...malePatient,
  name: [{ given: ['Long', 'Name'], family: 'VeryLongLastName' }],
};

const femalePatient = {
  name: [{ given: ['Jane'], family: 'Doe' }],
  birthDate: '1993-12-25',
  gender: 'female',
};

const testProps = {
  patient: malePatient,
};

describe('PatientInfoCard', () => {
  beforeEach(() => {
    mockedUseLayoutType.mockReturnValue('large-desktop');
  });

  it('renders details for a male patient correctly', () => {
    renderPatientInfoCard();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('33, Male')).toBeInTheDocument();
  });

  it('renders details for a female patient correctly', () => {
    testProps.patient = femalePatient;
    renderPatientInfoCard();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('33, Female')).toBeInTheDocument();
  });

  it('truncates long names on non-tablet layouts', () => {
    testProps.patient = malePatientWithALongName;
    renderPatientInfoCard();

    expect(screen.getByText('Long Name VeryLongLastNam...', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('33, Male')).toBeInTheDocument();
  });

  it('renders null when no patient is provided', () => {
    testProps.patient = null;
    renderPatientInfoCard();

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Long Name VeryLongLastNam...')).not.toBeInTheDocument();
  });
});

function renderPatientInfoCard() {
  render(<PatientInfoCard {...testProps} />);
}
