import React from 'react';
import FormEntry from './form-entry.component';
import { screen, render } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { usePatient, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const testProp = {
  patient: mockPatient,
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  patientUuid: mockPatient.id,
};

const mockFormEntrySub = jest.fn();
const mockUseVisit = useVisit as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  get formEntrySub() {
    return mockFormEntrySub();
  },
}));

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
  useVisit: jest.fn(),
  usePatient: jest.fn(),
}));

describe('FormEntry', () => {
  const renderFormEntry = () => {
    mockUsePatient.mockReturnValue({ patient: mockPatient });
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );
    return render(<FormEntry {...testProp} />);
  };

  it('should render form entry extension', () => {
    renderFormEntry();
    expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });
});
