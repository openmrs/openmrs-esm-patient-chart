import React from 'react';
import FormEntry from './form-entry.component';
import { screen, render } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { usePatientOrOfflineRegisteredPatient, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';

const testProp = {
  patient: mockPatient,
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  patientUuid: mockPatient.id,
};

const mockFormEntrySub = jest.fn();
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;
const mockUsePatientOrOfflineRegisteredPatient = usePatientOrOfflineRegisteredPatient as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  get formEntrySub() {
    return mockFormEntrySub();
  },
  useVisitOrOfflineVisit: jest.fn(),
  usePatientOrOfflineRegisteredPatient: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
}));

describe('FormEntry', () => {
  const renderFormEntry = () => {
    mockUsePatientOrOfflineRegisteredPatient.mockReturnValue({ patient: mockPatient });
    mockUseVisitOrOfflineVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
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
