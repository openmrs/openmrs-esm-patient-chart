import React from 'react';
import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { ExtensionSlot, useConnectivity } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import FormEntry, { type FormEntryProps } from './form-entry.component';

const defaultProps: FormEntryProps = {
  form: {
    uuid: 'some-form-uuid',
    name: '',
    version: '',
    published: false,
    retired: false,
    resources: [],
  },
  encounterUuid: 'some-encounter-uuid',
  patientUuid: mockPatient.id,
  patient: mockPatient,
  visitContext: null,
  mutateVisitContext: null,
  closeWorkspace: jest.fn(),
};

const mockFormEntrySub = jest.fn();
const mockUseConnectivity = jest.mocked(useConnectivity);

const mockExtensionSlot = jest.mocked(ExtensionSlot);

describe('FormEntry', () => {
  it('renders an extension where the form entry widget plugs in', async () => {
    mockUseConnectivity.mockReturnValue(true);
    mockFormEntrySub.mockReturnValue(
      new BehaviorSubject({ encounterUuid: null, formUuid: 'some-form-uuid', patient: mockPatient }),
    );
    mockExtensionSlot.mockImplementation((ext) => ext.name as any);

    render(<FormEntry {...defaultProps} />);

    await screen.findByText(/form-widget-slot/);
    expect(screen.getByText(/form-widget-slot/)).toBeInTheDocument();
  });
});
