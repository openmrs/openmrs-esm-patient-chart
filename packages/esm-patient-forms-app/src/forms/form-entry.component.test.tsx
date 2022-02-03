import React from 'react';
import FormEntry from './form-entry.component';
import { screen, render } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { useConnectivity, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const mockFormEntrySub = jest.fn();
const mockUseVisit = useVisit as jest.Mock;
const mockUseConnectivity = useConnectivity as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  get formEntrySub() {
    return mockFormEntrySub();
  },
}));

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
  useVisit: jest.fn(),
  useConnectivity: jest.fn(),
}));

describe('FormEntry', () => {
  const renderFormEntry = () => {
    mockUseConnectivity.mockReturnValue(true);
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );
    return render(<FormEntry patient={mockPatient} patientUuid={mockPatient.id} />);
  };

  it('should render form entry extension', () => {
    renderFormEntry();
    expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });
});
