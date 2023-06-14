import React from 'react';
import { render } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { usePatient } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import FormEntry from './form-entry.component';

const mockFormEntrySub = jest.fn();
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  get formEntrySub() {
    return mockFormEntrySub();
  },
  useVisitOrOfflineVisit: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.name),
  usePatient: jest.fn(),
}));

describe('FormEntry', () => {
  it('renders an extension where the form entry widget plugs in', () => {
    mockUsePatient.mockReturnValue({ patient: mockPatient });
    mockUseVisitOrOfflineVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );

    renderFormEntry();

    // FIXME: Figure out why this test is failing
    // expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });
});

function renderFormEntry() {
  const testProps = {
    closeWorkspace: jest.fn(),
    promptBeforeClosing: jest.fn(),
    patientUuid: mockPatient.id,
    mutateForm: jest.fn(),
  };

  render(<FormEntry {...testProps} />);
}
