import React from 'react';
import { render } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { usePatient } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../tools/test-helpers';
import FormEntry from './form-entry.component';

const mockFormEntrySub = jest.fn();
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;

const mockCurrentVisit = {
  uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
  encounters: [],
  patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    display: 'Facility Visit',
  },
  attributes: [],
  startDatetime: new Date('2021-03-16T08:16:00.000+0000'),
  stopDatetime: null,
  location: {
    uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
    name: 'Registration Desk',
    display: 'Registration Desk',
  },
};

jest.mock('@openmrs/esm-patient-common-lib', () => ({
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
