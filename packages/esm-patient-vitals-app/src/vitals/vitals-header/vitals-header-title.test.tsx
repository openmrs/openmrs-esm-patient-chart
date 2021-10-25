import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { PatientVitals } from '../vitals.resource';
import VitalsHeaderTitle from './vitals-header-title.component';

const mockToggleView = jest.fn();

const mockVitals: PatientVitals = {
  id: 'bca4d5f1-ee6a-4282-a5ff-c8db12c4247c',
  date: new Date('12-Mar-2019'),
  systolic: 120,
  diastolic: 80,
  temperature: 36.5,
  oxygenSaturation: 88,
  weight: 85,
  height: 185,
  bmi: 24.8,
  respiratoryRate: 45,
};

const testProps = {
  showDetails: false,
  showRecordVitals: true,
  toggleView: mockToggleView,
  view: 'Warning',
  vitals: mockVitals,
};

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('VitalsHeaderTitle: ', () => {
  it("renders an empty state view when there's no vitals data to show", async () => {
    testProps.vitals = null;

    renderVitalsHeaderTitle();

    expect(await screen.findByText(/No data has been recorded for this patient/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Record Vitals/i })).toBeInTheDocument();
  });

  it("renders the patient's most recently recorded vitals", () => {
    testProps.vitals = mockVitals;

    renderVitalsHeaderTitle();

    expect(screen.getByText(/Record Vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/Vitals & Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Last recorded: 12 - Mar - 2019/i)).toBeInTheDocument();
    expect(screen.getByTitle(/warningfilled/i)).toBeInTheDocument();

    const ChevronDown = screen.queryByTitle(/ChevronDown/);
    userEvent.click(ChevronDown);

    expect(mockToggleView).toHaveBeenCalledTimes(1);
  });

  it('should launch the vitals form when record vitals button is clicked', () => {
    renderVitalsHeaderTitle();

    const recordVitalsButton = screen.getByText(/Record Vitals/i);
    userEvent.click(recordVitalsButton);

    expect(launchPatientWorkspace).toHaveBeenCalled();
    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-vitals-biometrics-form-workspace');
  });
});

function renderVitalsHeaderTitle() {
  render(<VitalsHeaderTitle {...testProps} />);
}
