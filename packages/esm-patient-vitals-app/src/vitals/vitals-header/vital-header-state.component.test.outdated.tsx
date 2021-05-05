import React from 'react';
import VitalHeader from './vital-header-state.component';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { render, screen } from '@testing-library/react';
import { of } from 'rxjs';
import { performPatientsVitalsSearch } from '../vitals-biometrics.resource';

const mockPerformPatientsVitalSearch = performPatientsVitalsSearch as jest.Mock;

dayjs.extend(isToday);

jest.mock('../vitals-biometrics.resource', () => ({
  performPatientsVitalsSearch: jest.fn(),
}));

describe('<VitalHeader/>', () => {
  const mockVitals = [
    {
      id: 'bca4d5f1-ee6a-4282-a5ff-c8db12c4247c',
      date: '2020-11-27T09:06:13.000+00:00',
      systolic: 120,
      diastolic: 80,
      temperature: 36.5,
      oxygenSaturation: 88,
      weight: 85,
      height: 185,
      bmi: '24.8',
      respiratoryRate: 45,
    },
  ];

  beforeEach(() => {
    mockPerformPatientsVitalSearch.mockReturnValue(of(mockVitals));
  });

  beforeEach(() => {
    render(<VitalHeader />);
  });

  it('should display default vital header', () => {
    expect(screen.getByText(/Vitals & Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Last recorded: 27 - Nov - 2020/i)).toBeInTheDocument();
    expect(screen.getByText(/Record Vitals/)).toBeInTheDocument();
    const chevronDown = screen.getByTitle(/ChevronDown/);

    userEvent.click(chevronDown);

    expect(screen.getByText(/Temp/i)).toBeInTheDocument();
    expect(screen.getByText(/Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/SPO2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R. Rate/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Height/i)).toBeInTheDocument();
    expect(screen.getByText(/BMI/i)).toBeInTheDocument();
    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
  });
});
