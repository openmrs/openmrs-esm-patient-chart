import React from 'react';
import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { ExtensionSlot, useConnectivity } from '@openmrs/esm-framework';
import {
  type ClinicalFormsWorkspaceWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import FormEntry, { type FormEntryWorkspaceProps } from './form-entry.workspace';

const defaultProps: PatientWorkspace2DefinitionProps<FormEntryWorkspaceProps, ClinicalFormsWorkspaceWindowProps> = {
  closeWorkspace: jest.fn(),
  workspaceProps: {
    form: {
      uuid: 'some-form-uuid',
      name: '',
      version: '',
      published: false,
      retired: false,
      resources: [],
    },
    encounterUuid: 'some-encounter-uuid',
  },
  windowProps: {
    formEntryWorkspaceName: '',
  },
  groupProps: {
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null,
    mutateVisitContext: null,
  },
  workspaceName: '',
  launchChildWorkspace: jest.fn(),
};

const mockFormEntrySub = jest.fn();
const mockUseConnectivity = jest.mocked(useConnectivity);

const mockCurrentVisit = {
  uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
  encounters: [],
  patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    display: 'Facility Visit',
  },
  attributes: [],
  startDatetime: '2021-03-16T08:16:00.000+0000',
  stopDatetime: null,
  location: {
    uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
    name: 'Registration Desk',
    display: 'Registration Desk',
  },
};

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
