import React from 'react';
import FormEntry from './form-entry.component';
import { screen, render } from '@testing-library/react';
import { formEntrySub } from './forms-utils';
import { BehaviorSubject } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { ExtensionSlot } from '@openmrs/esm-framework';

const mockFormEntrySub = jest.fn();

jest.mock('./forms-utils', () => ({
  get formEntrySub() {
    return mockFormEntrySub();
  },
}));

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
}));

describe('FormEntry', () => {
  const renderFormEntry = () => {
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );
    return render(<FormEntry />);
  };

  it('should render form entry extension', () => {
    const { container } = renderFormEntry();

    expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });
});
