import React from 'react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import VitalsHeaderStateTitle from './vital-header-title.component';
import { render, screen } from '@testing-library/react';
import { PatientVitals } from '../vitals-biometrics.resource';

dayjs.extend(isToday);

describe('<VitalsHeaderStateDetails/>', () => {
  const mockToggleView = jest.fn();

  const mockVitals: PatientVitals = {
    id: 'bca4d5f1-ee6a-4282-a5ff-c8db12c4247c',
    date: new Date('12-Mar-2019'),
    systolic: '120',
    diastolic: '80',
    temperature: ' 36.5',
    oxygenSaturation: '88',
    weight: '85',
    height: '185',
    bmi: '24.8',
    respiratoryRate: '45',
  };

  it("renders an empty state view when there's no vitals data to show", async () => {
    const mockParams = {
      showDetails: false,
      showRecordVitals: true,
      toggleView: mockToggleView,
      view: '',
      vitals: null,
    };

    render(<VitalsHeaderStateTitle {...mockParams} />);
    expect(await screen.findByText(/No data has been recorded for this patient/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Record Vitals/i })).toBeInTheDocument();
  });

  it("renders the patient's last recorded vitals", () => {
    const mockParams = {
      showDetails: false,
      showRecordVitals: true,
      toggleView: mockToggleView,
      view: 'Warning',
      vitals: mockVitals,
    };

    render(<VitalsHeaderStateTitle {...mockParams} />);
    expect(screen.getByText(/Record Vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/Vitals & Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Last recorded: 12 - Mar - 2019/i)).toBeInTheDocument();
    expect(screen.getByTitle(/warningfilled/i)).toBeInTheDocument();

    const ChevronDown = screen.queryByTitle(/ChevronDown/);
    userEvent.click(ChevronDown);

    expect(mockToggleView).toHaveBeenCalledTimes(1);
  });
});
